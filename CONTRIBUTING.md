# Contributing Guide

Thank you for your interest in improving NOTICA!

## Development Setup

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/my-feature
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run locally:

   ```bash
   npm run dev
   ```

## Commit Style

Follow the [Conventional Commits](https://www.conventionalcommits.org) format:

```
feat: add new sync scheduler
fix: correct Notion callback error handling
docs: update README for OAuth setup
```

## Pull Request

- Run `npm run lint` and ensure tests pass.
- Describe _what_ and _why_ in your PR body.
- Small, focused changes are easier to review.

## Code of Conduct

Be respectful, concise, and inclusive in all discussions.
