# Contributing to OpenWork

Thank you for your interest in contributing to OpenWork!

## Code of Conduct

Be respectful, inclusive, and considerate. We are here to build something useful together. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## How to Contribute

### Reporting Issues

Found a bug or have a feature request?

1. Search existing issues first to avoid duplicates
2. Create a new issue with:
   - Clear title describing the problem
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment (OS, Bun version, etc.)
   - Relevant logs (redact any secrets!)

**Security issues:** If you find a security vulnerability, DO NOT open a public issue. Email security@aissential.pro instead.

### Suggesting Features

Have an idea for OpenWork?

1. Check existing issues for similar suggestions
2. Open a feature request with:
   - Clear description of the feature
   - Use case / problem it solves
   - Proposed implementation (if you have ideas)

Note: Some features may be designated for OpenWork Pro. We will discuss scope during review.

### Submitting Code

Ready to contribute code?

1. **Check existing issues** - See if someone is already working on it
2. **Fork the repository** - Create your own copy
3. **Create a branch** - `git checkout -b feature/your-feature-name`
4. **Make your changes** - Follow the code style of the project
5. **Test your changes** - Run `bun test` to ensure tests pass
6. **Commit your changes** - Use clear commit messages
7. **Push and create PR** - Submit a pull request

### Code Style

- Use TypeScript
- Follow existing patterns in the codebase
- Run `bun run typecheck` before submitting
- Add tests for new functionality

### Commit Messages

Use clear, descriptive commit messages:
- `feat: add new feature`
- `fix: resolve bug in X`
- `docs: update README`
- `chore: update dependencies`

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/openwork.git
cd openwork

# Install dependencies
bun install

# Run tests
bun test

# Start development
bun run start
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to OpenWork!
