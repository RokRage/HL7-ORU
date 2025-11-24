# Context

## ORU^R01 Grouping (HL7 v2)
- Message has one patient group (PID with optional PD1/NK1) and optional visit (PV1/PV2).
- Orders live under patient: each order/observation group is ORC (often present) followed by one or more OBR segments, each with its own OBX children.
- OBX segments belong to their parent OBR and stay in order; NTE may follow OBR or each OBX.
- SAC/SPM specimen segments can appear between ORC and OBR depending on profile.
- Grouping order: MSH … PID … [PV1] then repeating ORC groups → ORC [SAC/SPM] then repeating OBR → OBR [NTE] then repeating OBX → OBX [NTE].
- In this project we expect a single ORC per message with multiple OBRs and OBXs beneath it; if multiple ORCs appear, iterate ORDER_OBSERVATION groups separately.
