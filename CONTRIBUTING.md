# Contributing to Haushalt-Quest

Thanks for your interest in contributing! Whether it's a bug report, feature idea, or code contribution, all input is welcome.

## Getting Started

See the [README](README.md#development-setup) for instructions on setting up a local development environment.

## Code Style

- **TypeScript** in strict mode — no `any` unless explicitly suppressed
- **Tailwind CSS** for all styling, using [shadcn/ui](https://ui.shadcn.com/) components
- **Vitest** for testing — run `npm test` to execute the test suite
- **Code comments** in English
- **UI text** in German (the app's default language)

## Pull Request Process

1. Fork the repository and create a feature branch from `main`
2. Make your changes
3. Write or update tests for new functionality
4. Ensure all checks pass:
   ```bash
   npm test
   npm run lint
   ```
5. Submit a pull request with a clear description of what changed and why

## Reporting Issues

Use [GitHub Issues](https://github.com/FrFrey98/haushalt-quest/issues) to report bugs or suggest features. When reporting a bug, please include:

- Steps to reproduce the issue
- Expected vs. actual behavior
- Environment details (browser, OS, Docker version if applicable)
