# Mirth Connect JavaScript Snippet Archive

This repository is a general-purpose archive of reusable JavaScript snippets for Mirth Connect.

It includes examples for HL7 parsing, JSON transformation, and message filtering that you can copy into transformers, filters, or writers and adapt per channel.

## Snippets
- `Mirth Connect - ORU - JSON Output - Group ORC OBR OBX.js`  
  Parses ORU-style messages and groups data by ORC/OBR/OBX into structured JSON.
- `Mirth Connect - Simple JSON Output.js`  
  Minimal `XmlUtil.toJson(msg)` example for JSON outbound channels.
- `Mirth Connect - Filter - Exclude or Include based on small set of NHS number.js`  
  Example filter logic for allow/deny decisions from a small NHS number set.
- `Mirth Connect - ORU - Split Multiple Tests into Single ORU Messages.js`  
  Splits one inbound ORU with multiple test groups into one single-test ORU message per `OBR`.

## How To Use
1. Open your Mirth channel and paste a snippet into the appropriate JavaScript step (Filter/Transformer/Writer).
2. Validate field mappings and assumptions against your local message format.
3. Test with representative sample messages before promoting to production.

## Notes
- Snippets are intended as starting points, not drop-in production code.
- Update segment/field indices and guard clauses to match your feed variations.
- Keep environment-specific constants (IDs, endpoints, allowlists) external where possible.

## API Bootstrap
- Generic create/deploy script: `scripts/create_mirth_interface_via_api.sh`
- ORU wrapper script: `scripts/create_oru_split_interface_via_api.sh`
- Reusable runbook: `docs/MIRTH_CONNECT_PROJECT_BOOTSTRAP.md`
- Destination routing is defined by your chosen template; scripts do not require split-route designs.
