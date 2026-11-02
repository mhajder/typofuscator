# Contributing

Thanks for helping out! Bug reports and feature requests go through the [issue templates](https://github.com/mhajder/typofuscator/issues/new/choose). For security vulnerabilities, follow [SECURITY.md](SECURITY.md) instead.

## Development setup

```sh
git clone https://github.com/mhajder/typofuscator.git
cd typofuscator
pnpm install
prek install
```

`prek install` sets up git hooks that format, lint, spellcheck with `typos`, and run test suites automatically on commit.

## Before opening a pull request

Ensure all automated checks pass locally before opening a pull request:

```sh
prek run --all-files
pnpm test:coverage
pnpm build
```

- Add or update tests for any new features or bug fixes.
- Maintain test coverage above the configured thresholds (95% statements/lines, 90% branches).
- Update the [README.md](README.md) when adding new algorithms, settings, or user-facing behavior.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(algo): add leetspeak lookalike mode` or `fix(theme): preserve dark mode on reload`. Release notes and version bumps are generated from them.

## License

By contributing, you agree that your contributions will be licensed under the project's **GNU Affero General Public License v3.0** (AGPL-3.0-only).
