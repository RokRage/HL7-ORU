/**
 * JavaScript Writer/Transformer for Mirth Connect.
 *
 * Iterates each ORDER_OBSERVATION group (ORC + OBR + related OBX) in order
 * and writes selected fields to a database table. Adjust the JDBC settings,
 * table name, and field paths as needed for your environment.
 */

// --- Connection setup for SQL Server (replace with your details or remove if using Database Writer) ---
var db = DatabaseConnectionFactory.createDatabaseConnection(
    'com.microsoft.sqlserver.jdbc.SQLServerDriver', // JDBC driver class
    'jdbc:sqlserver://dbhost:1433;databaseName=lab', // JDBC URL
    'dbuser',                                        // username
    'dbpass'                                         // password
);

// Helper: safe field accessor on a pipe-split segment (0-based index).
function field(parts, idx) {
    return (parts && parts.length > idx) ? String(parts[idx]) : '';
}

try {
    // Work from the raw HL7 so grouping matches wire order.
    var raw = connectorMessage.getRawData ? String(connectorMessage.getRawData()) :
              (connectorMessage.getEncodedData ? String(connectorMessage.getEncodedData()) : String(msg));
    var lines = raw.split(/\\r\\n|\\n|\\r/);

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

    var payload = JSON.stringify(result);

    // Write the JSON as a single text block to a table; adjust table/column as needed.
    var sql = "INSERT INTO lab_result_json (payload) VALUES (?)";
    db.executeUpdate(sql, [payload]);
} finally {
    db.close();
}

return true; // Let the connector continue processing
