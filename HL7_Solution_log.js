/**
 * Logging-only version of the HL7 ORC/OBR/OBX extractor for Mirth Connect.
 * Iterates each ORDER_OBSERVATION group and logs the gathered fields instead
 * of writing to a database.
 */

// Helper: safe field accessor on a pipe-split segment (0-based index).
function field(parts, idx) {
    return (parts && parts.length > idx) ? String(parts[idx]) : '';
}

// Work from the raw HL7 so grouping matches wire order.
var raw = connectorMessage.getRawData ? String(connectorMessage.getRawData()) :
          (connectorMessage.getEncodedData ? String(connectorMessage.getEncodedData()) : String(msg));
var lines = raw.split(/\r\n|\n|\r/);

var result = { orc2: '', orc3: '', obrs: [] };
var currentObr = null;

for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line || line.trim() === '') {
        continue;
    }
    var parts = line.split('|');
    var seg = parts[0];

    if (seg === 'ORC') {
        result.orc2 = field(parts, 2); // ORC-2 Placer Order Number (per feed assumption)
        result.orc3 = field(parts, 3); // ORC-3 Filler Order Number
    } else if (seg === 'OBR') {
        currentObr = {
            obr2_1: obr2Parts[0] || '', // OBR-2.1 Placer Order Number (entity id)
            obr3_1: obr3Parts[0] || '', // OBR-3.1 Filler Order Number (entity id)
            obr4_code: field(parts, 4).split('^')[0],
            obr4_text: field(parts, 4).split('^')[1] || '',
            obr7: field(parts, 6), // Observation Date/Time
            obxs: []
        };
        result.obrs.push(currentObr);
    } else if (seg === 'OBX' && currentObr) {
        var obx3 = field(parts, 3).split('^');
        currentObr.obxs.push({
            obx3_code: obx3[0] || '',
            obx3_text: obx3[1] || '',
            obx5: field(parts, 5),
            obx6: field(parts, 6),
            obx11: field(parts, 11),
            obx14: field(parts, 14)
        });
    }
}

logger.info(JSON.stringify(result));

return true; // Let the connector continue processing
