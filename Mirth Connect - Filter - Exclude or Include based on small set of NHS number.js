var TEST_NHS = {
    '4444444444': true,
    '5555555555': true,
    '9999999999': true,
    '1111111111': true,
    '2222222222': true,
    '3333333333': true
};

function getNhsFromPid3(msg) {
    var nhs = '';
    try {
        var pid3List = msg['PID']['PID.3'];
        for (var i = 0; i < pid3List.length(); i++) {
            var cx = pid3List[i];
            var idType = (cx['PID.3.5'].toString() || '').toUpperCase().trim();
            if (idType == 'NHS') {
                nhs = (cx['PID.3.1'].toString() || '').replace(/\D/g, '');
                if (nhs.length > 0) {
                    break;
                }
            }
        }
    } catch (e) {
        nhs = '';
    }
    return nhs;
}

function isAdt(msg) {
    try {
        var msgCode = (msg['MSH']['MSH.9']['MSH.9.1'].toString() || '').toUpperCase().trim();
        return msgCode == 'ADT';
    } catch (e) {
        return false;
    }
}

var nhs = getNhsFromPid3(msg);

return isAdt(msg) && !!TEST_NHS[nhs];