<div align="center">

# Typofuscator

**Smart text obfuscation tool that scrambles words and injects homoglyphs while preserving human readability**

[![Release](https://img.shields.io/github/v/release/mhajder/typofuscator?logo=github)](https://github.com/mhajder/typofuscator/releases/latest)
[![License](https://img.shields.io/github/license/mhajder/typofuscator)](https://github.com/mhajder/typofuscator/blob/main/LICENSE)
[![CI](https://github.com/mhajder/typofuscator/actions/workflows/ci.yml/badge.svg)](https://github.com/mhajder/typofuscator/actions/workflows/ci.yml)
[![Deploy](https://github.com/mhajder/typofuscator/actions/workflows/deploy.yml/badge.svg)](https://github.com/mhajder/typofuscator/actions/workflows/deploy.yml)

[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![PWA](https://img.shields.io/badge/PWA-offline%20ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/explore/progressive-web-apps)

[🌐 Live Demo](https://mhajder.github.io/typofuscator) · [✨ Features](#-features) · [🧠 How It Works](#-how-it-works) · [🚀 Getting Started](#-getting-started) · [🛠️ Development](#️-development) · [📄 License](#-license)

</div>

---

**Typofuscator** is a client-side web application and TypeScript engine that obfuscates text by rearranging middle letters and substituting lookalike characters (homoglyphs). The resulting text remains effortlessly decipherable by human brains due to typoglycemia, while degrading automated scrapers, AI ingestion pipelines, content filters, and machine translators.

## ✨ Features

### 🔀 Typoglycemic Obfuscation

- **Preserved Anchor Letters**: Keeps the first and last letters of words intact by default, maintaining cognitive reading fluency.
- **Configurable Algorithms**:
  - `swap`: Random adjacent and non-adjacent swaps with collision prevention.
  - `shuffle`: Full internal permutation with Fisher-Yates randomization.
  - `reverse`: Deterministic internal letter reversal.
- **Adjustable Intensity**: Select between `light`, `medium`, and `heavy` swap presets, or configure custom swap boundaries.
- **Collision & Duplicate Avoidance**: Retries permutations to guarantee scrambled words do not accidentally match the original word.

### 🎭 Homoglyph & Lookalike Injection

- **Cross-Script Character Replacement**: Replaces Latin characters with visually indistinguishable characters from other scripts:
  - **Cyrillic** (e.g., `a` → `а`, `e` → `е`, `o` → `о`, `p` → `р`)
  - **Greek** (e.g., `A` → `Α`, `B` → `Β`, `e` → `ε`)
  - **Latin alternates** (e.g., `a` → `ɑ`, `e` → `ɛ`, `o` → `ɵ`)
  - **Mixed Mode**: Combines all sets for maximal visual similarity and token disruption.
- **Substitution Control**: Configure modes (`off`, `some`, `all`) and fine-tune replacement probability (`0%` to `100%`).

### 📱 Modern User Experience & PWA

- **100% Offline Capability**: Built as an installable Progressive Web App (PWA) with a dedicated Service Worker precaching assets and handling offline fallbacks.
- **Reactive Interface**: Built with modern **Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`) for zero-lag real-time scrambling as you type.
- **Theme Detection & Switcher**: System preference detection (`prefers-color-scheme`) with smooth light/dark switching and persistent local storage.
- **Import / Export Settings**: Easily export and share tailored configuration profiles as JSON.
- **Zero Tracking**: 100% local client-side execution; your text never leaves your browser.

---

## 🧠 How It Works

Typofuscator leverages **typoglycemia** — the cognitive phenomenon where the human mind reads words as a whole rather than letter by letter, provided the outer boundaries remain unchanged:

```text
Original:     A l g o r i t h m   t h a t   s c r a m b l e s   l e t t e r s
              │ │             │   │ │   │   │ │             │   │ │         │
              ▼ └──────┬──────┘   ▼ └─┬─┘   ▼ └──────┬──────┘   ▼ └────┬────┘
Boundaries:  [A]      ...        [m] [t] . [t] [s]      ...        [s] [l] ... [s]
                       │              │              │                  │
Obfuscated:   A r g o l i t h m   t a h t   s l b m a r c e s   l t t e e r s
```

Combined with homoglyph replacement:

```text
Standard:     camera
              ││││││
Cyrillic:     самеrа  (Unicode: \u0441 \u0430 \u043c \u0435 r \u0430)
```

Automated language models and tokenizers treat homoglyphs as entirely foreign tokens, while the human visual cortex perceives them identically.

---

## 🚀 Getting Started

### Online

Access the hosted web app instantly at **[mhajder.github.io/typofuscator](https://mhajder.github.io/typofuscator)**.

### Local Development

#### Prerequisites

- **Node.js**: `26.x` or later (tested on Node 26)
- **pnpm**: `12.x` or later

#### Setup

```bash
# Clone the repository
git clone https://github.com/mhajder/typofuscator.git
cd typofuscator

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Development

### Available Scripts

| Command              | Description                                                         |
| :------------------- | :------------------------------------------------------------------ |
| `pnpm dev`           | Start Vite development server with HMR                              |
| `pnpm build`         | Compile production static build with Brotli/Gzip precompression     |
| `pnpm preview`       | Locally preview the production static build                         |
| `pnpm check`         | Run SvelteKit sync and TypeScript diagnostics via `svelte-check`    |
| `pnpm lint`          | Run Prettier format check and ESLint analysis                       |
| `pnpm format`        | Automatically fix formatting across all files with Prettier         |
| `pnpm test`          | Run Vitest in interactive watch mode                                |
| `pnpm test:run`      | Run the complete Vitest test suite once                             |
| `pnpm test:coverage` | Run Vitest with v8 coverage and enforce thresholds                  |
| `pnpm test:e2e`      | Run Playwright end-to-end browser tests (Chromium, Firefox, WebKit) |

### Pre-commit Quality Pipeline

This repository uses [`prek`](https://github.com/j178/prek) to enforce static code checks before commits:

```bash
# Run all pre-commit checks manually
prek run --all-files

# Run spell checking
prek run typos --all-files
```

Pre-commit hooks validate:

- File formatting and syntax (JSON, YAML, TOML, Markdown, CSS, JS, TS, Svelte)
- Source code spelling with [`typos`](https://github.com/crate-ci/typos)
- Git safety checks (case conflict, merge conflict, line endings, max file size)
- Svelte type validity and unit test execution

---

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines, and follow [SECURITY.md](SECURITY.md) to report vulnerabilities privately.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/amazing-feature`).
3. Ensure all tests and linters pass (`prek run --all-files` and `pnpm test:coverage`).
4. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/) (`feat: add new feature`).
5. Push to your branch and open a Pull Request.

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0** — see the [LICENSE](LICENSE) file for details.
