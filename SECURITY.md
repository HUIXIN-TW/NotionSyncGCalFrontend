# Security Policy

## Supported Versions

Only the latest `master` branch receives security updates.

## Reporting a Vulnerability

If you discover a security issue:

1. **Do not** open a public GitHub issue.
2. Email **whtnw.studio@gmail.com**
3. Include details: steps to reproduce, affected routes, and impact estimate.

We aim to acknowledge reports within **72 hours** and provide a fix within **14 days**.

## Disclosure

Please avoid sharing proof-of-concepts or screenshots publicly until a patch
is released. Responsible disclosure helps keep all users safe.

## Secrets Management

This project never stores production secrets in code or version control.
Environment variables such as OAuth client secrets, JWT keys, and database
credentials must be configured via secure secret managers (AWS SSM / Secrets Manager).
