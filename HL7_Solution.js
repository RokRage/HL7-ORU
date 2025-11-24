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

/**
 * Safely returns a field value as a string, falling back to '' when missing.
 */
function asString(field) {
    return (field && field.toString) ? field.toString() : '';
}

try {
    // The HL7 message is XML in "msg". Each ORDER_OBSERVATION corresponds to one ORC/OBR with its OBX children.
    var orders = msg['ORDER_OBSERVATION'];

    for (var i = 0; i < orders.length(); i++) {
        var group = orders[i];
        var orc = group['ORC'];
        var obr = group['OBR'];
        var obxes = group.getAll('OBX'); // preserves message order

        // Pull ORC/OBR fields once per group
        var orcId    = asString(orc['ORC.2']['EI.1']);  // Filler Order Number
        var placerId = asString(orc['ORC.3']['EI.1']);  // Placer Order Number
        var obrCode  = asString(obr['OBR.4']['CE.1']);  // Observation ID code
        var obrText  = asString(obr['OBR.4']['CE.2']);  // Observation ID text
        var obsDt    = asString(obr['OBR.7']['TS.1']);  // Observation date/time

        // Loop each OBX tied to this ORC/OBR
        for (var j = 0; j < obxes.length(); j++) {
            var obx = obxes[j];
            var obxCode  = asString(obx['OBX.3']['CE.1']);
            var obxText  = asString(obx['OBX.3']['CE.2']);
            var value    = asString(obx['OBX.5'][0]);      // first repetition of value
            var units    = asString(obx['OBX.6']['CE.1']);
            var status   = asString(obx['OBX.11']);        // Observation result status
            var valueDt  = asString(obx['OBX.14']['TS.1']); // Date/time of the observation

            // Call your stored procedure instead of direct INSERT; adjust name/params as needed.
            var sql = "{ call usp_save_lab_result(?,?,?,?,?,?,?,?,?,?,?) }";

            db.executeUpdate(
                sql,
                [
                    orcId,
                    placerId,
                    obrCode,
                    obrText,
                    obsDt,
                    obxCode,
                    obxText,
                    value,
                    units,
                    status,
                    valueDt
                ]
            );
        }
    }
} finally {
    db.close();
}

return true; // Let the connector continue processing
