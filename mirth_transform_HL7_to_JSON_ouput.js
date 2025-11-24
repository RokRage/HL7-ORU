/**
 * Minimal HL7-to-JSON transformer for Mirth Connect.
 * Converts the parsed HL7 (E4X XML in msg) to JSON using the built-in serializer
 * and places the JSON string on the channel map.
 */

// Serialize the HL7 XML tree to JSON string
var jsonStr = SerializerFactory.getSerializer('JSON').fromXML(msg);

// Make available to downstream steps/connectors
channelMap.put('hl7Json', jsonStr);

// Optionally log for debugging; comment out if noisy
logger.info(jsonStr);

// Return JSON if used in a JavaScript Transformer/Writer
return jsonStr;
