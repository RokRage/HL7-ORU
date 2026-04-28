/*
 * Mirth Connect - ORU - Split Multiple Tests into Single ORU Messages
 *
 * Purpose:
 * - Take one inbound ORU message (ER7) containing multiple OBR test groups
 * - Split into one ORU message per OBR (with associated OBX/NTE/etc.)
 *
 * Recommended placement:
 * - Source Transformer (JavaScript step), then use split messages downstream
 *
 * Output:
 * - channelMap.put('split_oru_messages', <JSON array of ER7 messages>)
 * - channelMap.put('split_oru_count', <number>)
 * - channelMap.put('split_oru_first', <first ER7 message or empty>)
 */

function splitOruByObr(er7) {
    if (!er7) return [];

    var raw = String(er7).replace(/\n/g, '\r');
    var segments = raw.split('\r').filter(function (s) { return s && s.length > 0; });
    if (segments.length === 0) return [];

    var msh = segments[0].indexOf('MSH|') === 0 ? segments[0] : null;
    if (!msh) return [];

    var rest = segments.slice(1);
    var common = [];
    var i = 0;

    while (i < rest.length) {
        var seg = rest[i];
        var type = seg.substring(0, 3);
        if (type === 'ORC' || type === 'OBR') break;
        common.push(seg);
        i++;
    }

    var groups = [];
    var pendingOrc = null;
    var globalOrc = null;
    var current = null;

    for (; i < rest.length; i++) {
        var line = rest[i];
        var t = line.substring(0, 3);

        if (t === 'ORC') {
            pendingOrc = line;
            if (globalOrc === null) globalOrc = line;
            continue;
        }

        if (t === 'OBR') {
            if (current !== null) groups.push(current);

            current = {
                orc: pendingOrc || globalOrc,
                segments: [line]
            };
            pendingOrc = null;
            continue;
        }

        if (current !== null) {
            current.segments.push(line);
        }
    }

    if (current !== null) groups.push(current);

    var out = [];
    for (var g = 0; g < groups.length; g++) {
        var assembled = [msh].concat(common);
        if (groups[g].orc) assembled.push(groups[g].orc);
        assembled = assembled.concat(groups[g].segments);
        out.push(assembled.join('\r') + '\r');
    }

    return out;
}

var sourceEr7 = connectorMessage.getRawData();
var splitMessages = splitOruByObr(sourceEr7);

channelMap.put('split_oru_messages', JSON.stringify(splitMessages));
channelMap.put('split_oru_count', String(splitMessages.length));
channelMap.put('split_oru_first', splitMessages.length > 0 ? splitMessages[0] : '');

logger.info('Split ORU messages created: ' + splitMessages.length);
