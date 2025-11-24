# HL7 ORU to JSON (Mirth Connect)

Scripts in this workspace turn HL7 ORU messages into grouped JSON for logging, channel map use, or DB storage.

## Files
- `HL7_ORU_ExtractOBRGroups_OutJSON.js` — Raw HL7 line parser (ORC → OBR → OBX) that also captures patient info (PID-3/5/7/8) and OBR-2.1/3.1/4/7 fields. Builds grouped JSON, logs it, and assigns a pretty-printed JSON to `tmp`.
- `SimpleMirthJSONOutput.js` — Minimal transformer snippet using `XmlUtil.toJson(msg)` when the channel outbound is set to JSON with a JSON template.

## Usage
1) Drop the relevant script into a JavaScript Transformer/Writer in Mirth Connect.
2) For `HL7_ORU_ExtractOBRGroups_OutJSON.js`, read JSON from `tmp` (pretty-printed) or adjust to use the logged payload for downstream connectors.
3) If using `SimpleMirthJSONOutput.js`, set outbound data type to JSON and outbound template to `{}` in the channel, then the snippet populates the JSON.

## Notes
- Scripts assume standard ORU^R01 segments: PID, optional ORC, multiple OBRs with related OBXs.
- Adjust field indices if your feed differs (e.g., ORC-2/3 availability, name formatting). 
