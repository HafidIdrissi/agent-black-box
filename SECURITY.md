# Security and privacy

## Scope

Agent Black Box processes untrusted logs locally. It does not execute recorded tools, load files named inside logs, or fetch recorded URLs.

Best-effort redaction can miss secrets and personal data. Treat every export as sensitive until a person has reviewed it. This tool is not an anonymization or compliance guarantee.

## Reporting

Do not include credentials, private code, or real personal information in a public issue. Use a synthetic reproducer.

If GitHub offers **Security → Report a vulnerability** for this repository, use it. Private vulnerability reporting must be enabled by the repository owner; its presence is not assumed. Otherwise use an explicitly listed private maintainer contact. No dedicated security mailbox or response SLA is currently provided.

## Current protections

- Local-only read-only static server with a fixed asset allowlist and Host validation.
- Browser rendering through text nodes rather than interpreting imported HTML.
- Exported reports escape text and use a restrictive script-free Content Security Policy.
- Input size and event limits; tests for correlation, masking, and report containment.
- No third-party scripts or mandatory network services.

## Boundaries

This early project has not received an independent security audit. Browser extensions, compromised devices, terminal software, and other software with access to your machine are outside its protection. Clearing the viewer releases application references; it does not promise secure erasure from device memory.
