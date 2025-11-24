// Under channel 'Set Data Types' set the outbound to 'JSON'
// Under the source transformer change the outbound message template to JSON DataType
// Add : "{}" as the outbound template content.

// add this line to transform
// ALL DONE!
tmp = XmlUtil.toJson(msg)