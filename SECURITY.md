# Security Policy

## Reporting

Do not open a public GitHub issue for a security report. Two channels, in order of preference:

1. **GitHub private vulnerability reporting**, from this repository's Security tab.
2. **Email `security@simtabi.com`**, if you would rather not use GitHub.

Acknowledgement within 48 hours.

## Scope for this package

`@ichava/js-motion` runs in the browser and ships no runtime dependencies. The surface worth reporting
is animation configuration reaching the DOM from untrusted input, and the Lottie adapter, which
executes third-party animation data through a runtime the host supplies.
