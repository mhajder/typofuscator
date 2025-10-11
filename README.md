# Typofuscator

A sophisticated web application that obfuscates text by scrambling letters within words while maintaining human readability. This tool is designed to confuse machine translators, AI systems, and automated content filters while keeping text readable for humans.

## Features

- **Text Obfuscation**: Scramble text while keeping it human-readable
- **Dark Theme**: Toggle between light and dark themes with automatic system theme detection on first visit
- **Advanced Settings**: Customize scrambling intensity, algorithms, and word exclusions
- **Reproducible Results**: Use seed values for consistent scrambling
- **Settings Persistence**: Your preferences are saved locally
- **Import/Export**: Share your custom settings configurations

## How It Works

The algorithm intelligently scrambles letters within words while preserving human readability:

1. **Preserves Structure**: Keeps first and last letters of each word in place
2. **Smart Scrambling**: Randomly rearranges middle letters using configurable algorithms
3. **Context Aware**: Leaves punctuation, spacing, and short words unchanged
4. **Configurable Intensity**: Performs multiple random operations for longer words
5. **Quality Control**: Can retry scrambling to avoid duplicate results

This creates text that remains readable to humans but confuses machine translation systems, AI content filters, and automated processing tools.

## Installation & Development

### Prerequisites

- Node.js 20+
- pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/mhajder/typofuscator.git
cd typofuscator

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:5173 in your browser
```

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build

# Quality Assurance
pnpm lint         # Run ESLint and Prettier checks
pnpm format       # Format code with Prettier
pnpm check        # Type checking with Svelte

# Testing
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:ui      # Run tests with UI
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. **Code Quality**: Follow the existing code style and conventions
2. **Testing**: Add unit tests for new features
3. **Documentation**: Update README for significant changes
4. **Commits**: Use clear, descriptive commit messages

### Running Tests Before Committing

```bash
# Run all checks
pnpm lint
pnpm check
pnpm test:run
```

## License

This project is licensed under the **GNU Affero General Public License v3.0**. See the [LICENSE](LICENSE) file for details.
