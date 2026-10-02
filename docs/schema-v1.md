# Normalized trace v1

Input is a JSON object with schemaVersion: 1 and an events array. Unknown source metadata is omitted.

| Field | Behavior |
| --- | --- |
| id | Optional unique string; generated from position when omitted |
| timestamp | Optional ISO-style string or epoch milliseconds; invalid values produce warnings |
| type | Required: tool_call, tool_result, or message |
| tool | Nonempty string required on tool_call; inferred on correlated results |
| toolCallId | Invocation ID; defaults to the call event ID on tool_call |
| content | Text or JSON-compatible content, normalized to a string |
| input | JSON-compatible data; omitted becomes null |
| status | ok, error, or unknown; defaults to unknown |
| durationMs | Optional nonnegative finite number |

Results pair by invocation ID across the full recording. Ambiguous IDs are not guessed. A failed result marks its call failed; later success on that same invocation does not erase prior error evidence.

Analysis counts failed calls once plus failed results without unique matching calls. The timeline may display both a failed call and its result. Duration spans earliest to latest available timestamps and does not measure model compute time.

Bounds: 10 MiB UTF-8, 20,000 events, 100,000 JSONL lines, and 64 nested input levels. See examples/permission-loop.jsonl and web/demo.mjs for synthetic examples. Schema evolution and a machine-readable JSON Schema are future contribution proposals.

Masked exports remap event and invocation identifiers to local positional identifiers, preserving correlation without exposing token-shaped source IDs. Repetition analysis skips calls whose inputs or tool names contain the redaction marker and reports skippedMaskedCalls. This avoids false groups after different secrets become the same marker.
