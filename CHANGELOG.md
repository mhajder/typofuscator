# Changelog

## [0.3.0](https://github.com/mhajder/typofuscator/compare/v0.2.0...v0.3.0) (2026-11-02)


### 🚀 Features

* add real-time obfuscation metrics, URL share state, and keyboard shortcuts ([52151fe](https://github.com/mhajder/typofuscator/commit/52151fec76fde8628e5e311b73bae2f2498966c3))
* **app:** add document drag-and-drop file upload and text export ([bd79a4c](https://github.com/mhajder/typofuscator/commit/bd79a4cff2c05ac9309f260bd00d743475b525b2))
* **obfuscator:** add invisible zero-width token injection ([341281b](https://github.com/mhajder/typofuscator/commit/341281b2e3ac248113279b07c8f97013303b202f))
* **obfuscator:** add QWERTY keyboard proximity typos mode ([0a92742](https://github.com/mhajder/typofuscator/commit/0a92742d88b27636f15d739e2e14136b96c89f72))
* **pwa:** add service worker for offline support and PWA caching ([ddcc84f](https://github.com/mhajder/typofuscator/commit/ddcc84f01c057c87077112e318f4e862aa79caff))
* **pwa:** add service worker update notification toast with reload action ([f656f5e](https://github.com/mhajder/typofuscator/commit/f656f5edbf401d9632ba6b06a17f2a392a8d38f7))
* **settings:** add interactive exclusion tag chip input with presets ([77ad3e7](https://github.com/mhajder/typofuscator/commit/77ad3e77be0f88d92828e571a842451f77c34ab3))
* **share:** integrate native Web Share API with clipboard fallback ([9bafd45](https://github.com/mhajder/typofuscator/commit/9bafd4542933ef8f0c56d2a24c684b2fc890d41c))
* **ui:** add visual diff and inspection highlighter ([02a0191](https://github.com/mhajder/typofuscator/commit/02a019150fa938fd6404ca300f0333ff09d8bcaa))


### 🧹 Refactoring

* modernize components to Svelte 5 runes and clean up vite defines ([21002a9](https://github.com/mhajder/typofuscator/commit/21002a91dfdaee5b45323d857d52d53e809dcc2e))


### 📚 Documentation

* add GitHub community governance templates, security policy, contributing guide, and citation metadata ([b3cdb8b](https://github.com/mhajder/typofuscator/commit/b3cdb8b043db6b20a7bc981118372b043b348c70))
* modernize and enrich README with badges, architecture overview, and updated scripts ([dd84a6e](https://github.com/mhajder/typofuscator/commit/dd84a6e3354ac85a442764b910d8f6d88c356f9b))


### 🧩 CI

* consolidate workflows into ci.yml, add build check, pin pnpm 12, and add prek ([1961c46](https://github.com/mhajder/typofuscator/commit/1961c46ceb395b2626f3522568c9d1871331e102))
* exclude CHANGELOG.md from prek, prettier, and typos checks ([f1aa809](https://github.com/mhajder/typofuscator/commit/f1aa80938a8a8334d9c68cea0dad1fe3dc13010b))
* pin actions to commit SHAs at latest versions ([dbd7c4d](https://github.com/mhajder/typofuscator/commit/dbd7c4d5591f6f56f9f3f91bf9421bdd36be956c))
* **release:** add release-please automated release workflow and config ([bf44e9b](https://github.com/mhajder/typofuscator/commit/bf44e9b26cc8350d5ae1b38a15226315151139bc))
* run svelte-kit sync before prek and order svelte-check before eslint ([17af7ee](https://github.com/mhajder/typofuscator/commit/17af7ee2287b88223157f7e336091cf65c6757e6))
* update Node.js to 26 ([2a1d0ec](https://github.com/mhajder/typofuscator/commit/2a1d0ec62cbd97bed5b76ad0bd4774d02134cf40))


### 🧪 Tests

* add vitest coverage, expand test suite, and enforce coverage thresholds ([0dd9150](https://github.com/mhajder/typofuscator/commit/0dd91503e528e02bab50dd66ef0510159960fd59))
* **e2e:** add Playwright browser tests and CI workflow job ([c00b836](https://github.com/mhajder/typofuscator/commit/c00b8365c2bd9968bc6e0780fbe48a14284cc318))

## 0.2.0 (2026-11-02)

### 🚀 Features

- Text obfuscation and typoglycemia scrambling engine
- Homoglyph injection (Cyrillic, Latin, Greek)
- Dark and light theme switcher with persistent storage
- Advanced configuration options (intensity presets, custom min/max swaps, excluded words)
- Offline-ready Progressive Web App (PWA) with service worker
- End-to-end browser testing suite with Playwright (Chromium, Firefox, WebKit)
