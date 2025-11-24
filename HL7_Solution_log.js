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
// Use descendant lookup for OBR; take its parent’s OBX nodes to keep grouping intact.
var obrs = msg..OBR;
if (obrs == null || obrs.length() === 0) {
    obrs = new XMLList(); // keeps length() calls safe when no OBR exists
}
// There is always one ORC; prefer the top-level ORC, fallback to the ORC in the first OBR's parent group.
var orcSegment = (msg.ORC && msg.ORC.length() > 0) ? msg.ORC[0] : (obrs.length() > 0 && obrs[0].parent() && obrs[0].parent().ORC ? obrs[0].parent().ORC[0] : null);

var result = {
    orc2: asString(orcSegment ? orcSegment['ORC.2']['EI.1'] : ''),
    orc3: asString(orcSegment ? orcSegment['ORC.3']['EI.1'] : ''),
    obrs: []
};

for (var i = 0; i < obrs.length(); i++) {
    var obr = obrs[i];
    // Get OBX nodes that share the same parent as this OBR (usual HL7 grouping).
    var parent = obr.parent();
    var obxes = (parent && parent.OBX) ? parent.OBX : new XMLList();

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
