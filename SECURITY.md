# Security Policy

## Supported versions

Only the latest release gets security fixes. If possible, verify whether the issue still occurs on the latest version or the hosted deployment before reporting.

## Reporting a vulnerability

Please do not open a public issue. Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/mhajder/typofuscator/security/advisories/new).

Include the affected version, browser environment, clear reproduction steps, and potential impact. Do not include sensitive or personal data in reports.

I aim to acknowledge reports within 7 days and will provide updates until the vulnerability is addressed and released.

## Scope

In scope for this project:

- Cross-site scripting (XSS) or DOM injection through text input, settings import, or clipboard handling
- Insecure storage or unintended exfiltration of user input from the client
- Service Worker cache poisoning or offline integrity violations
- Denial of Service (ReDoS or browser freeze) caused by pathological input strings in the obfuscation engine
