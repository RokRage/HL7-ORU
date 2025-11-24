/**
 * Logging-only version of the HL7 ORC/OBR/OBX extractor for Mirth Connect.
 * Iterates each ORDER_OBSERVATION group and logs the gathered fields instead
 * of writing to a database.
 */

/**
 * Safely returns a field value as a string, falling back to '' when missing.
 */
function asString(field) {
    return (field && field.toString) ? field.toString() : '';
}

// Aggregate output as JSON: single ORC with child OBRs and their OBXs.
var orders = msg['ORDER_OBSERVATION'];
if (orders == null) {
    orders = new XMLList(); // keeps length() calls safe when no ORDER_OBSERVATION exists
}
var orcSegment = null;

// Prefer ORC inside the first order group; fallback to a top-level ORC if present.
if (orders.length() > 0 && orders[0]['ORC']) {
    orcSegment = orders[0]['ORC'];
} else if (msg['ORC']) {
    orcSegment = msg['ORC'];
}

var result = {
    orc2: asString(orcSegment ? orcSegment['ORC.2']['EI.1'] : ''),
    orc3: asString(orcSegment ? orcSegment['ORC.3']['EI.1'] : ''),
    obrs: []
};

for (var i = 0; i < orders.length(); i++) {
    var group = orders[i];
    var obr = group['OBR'];
    var obxes = group.getAll('OBX'); // preserves message order

    var obrEntry = {
        obr4_code: asString(obr['OBR.4']['CE.1']),
        obr4_text: asString(obr['OBR.4']['CE.2']),
        obr7: asString(obr['OBR.7']['TS.1']),
        obxs: []
    };

    for (var j = 0; j < obxes.length(); j++) {
        var obx = obxes[j];
        obrEntry.obxs.push({
            obx3_code: asString(obx['OBX.3']['CE.1']),
            obx3_text: asString(obx['OBX.3']['CE.2']),
            obx5: asString(obx['OBX.5'][0]),         // first repetition of value
            obx6: asString(obx['OBX.6']['CE.1']),
            obx11: asString(obx['OBX.11']),
            obx14: asString(obx['OBX.14']['TS.1'])
        });
    }

    result.obrs.push(obrEntry);
}

logger.info(JSON.stringify(result));

return true; // Let the connector continue processing
