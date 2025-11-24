# Context

## Files (tracked)

- `HL7_ORU_ExtractOBRGroups_OutJSON.js`: Parses raw HL7 line-by-line (ORC → OBR → OBX), captures patient demographics (PID-3, PID-5, PID-7, PID-8), ORC (ORC-2, ORC-3), OBR (OBR-2.1, OBR-3.1, OBR-4, OBR-7), and related OBXs, builds JSON, logs it, and assigns a pretty-printed JSON to `tmp`.

- `SimpleMirthJSONOutput.js`: Minimal transformer snippet using `XmlUtil.toJson(msg)`; intended for channels configured with JSON outbound datatype and template.

