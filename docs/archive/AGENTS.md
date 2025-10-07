# Repository Guidelines

## Project Structure & Module Organization
- `hypertext/` — shared runtime for the inline hypertext tooltip; most UI/interaction changes live in `hypertext-experience.js`.
- `demo/` — self-contained HTML files for manual QA (`hypertext_navigation_demo.html`, `simple_tooltip_redirect.html`, `simple_chat_page.html`).
- `tests/` — Playwright specs inside `tests/hypertext-demo.spec.mjs`; additional legacy suites exist in archived directories but are not maintained.
- `mockups/` and `claude_html/` — design references and specification docs to mirror before altering production code.

## Build, Test, and Development Commands
- `npm install` — install Node dependencies for running the demo and Playwright tests (run once per clone).
- `npx playwright test tests/hypertext-demo.spec.mjs` — executes the hypertext tooltip regression suite.
- `npx http-server .` — lightweight server for manually opening the demo HTML (optional; any static file server works).

## Coding Style & Naming Conventions
- JavaScript/TypeScript use 2-space indentation and trailing commas where possible; follow existing patterns in `hypertext-experience.js`.
- Prefer descriptive function names (`renderConversation`, `buildChatPayload`), camelCase for variables, and SCREAMING_SNAKE_CASE for shared constants.
- Update the inline CSS template (`BASE_STYLES`) using vanilla CSS; keep palette tokens (`--hx-*`) consistent across files.

## Testing Guidelines
- Playwright is the primary test harness; new UI work should extend `tests/hypertext-demo.spec.mjs` with focused scenarios rather than broad end-to-end flows.
- Name additional specs `tests/hypertext-<feature>.spec.mjs` and colocate fixtures under `tests/fixtures/` if needed.
- Run `npx playwright test` locally before pushing; aim for zero flaky waits—prefer explicit locators and assertions.
- **Recursive Hypertext Tests**: Run `npx playwright test tests/recursive-hypertext-regression.spec.mjs` to verify nested tooltip functionality (z-index stacking, auto-pin, lifecycle management).

## Commit & Pull Request Guidelines
- Follow the existing imperative style for commit subjects (e.g., “Add compact hypertext tooltip mockups and specs”). Keep the first line under 72 characters when possible.
- Include a concise body describing why the change matters; reference mockups or specs when relevant.
- Pull requests should summarize the UX impact, list tests (`npx playwright test …`), and attach screenshots/GIFs when altering visible UI.
- Link to design documents in `claude_html/` or `mockups/` so reviewers can trace back to source requirements.

## Security & Configuration Tips
- Do not commit API keys; the runtime expects `backendUrl` overrides via environment or demo script configuration.
- When testing against remote backends, use a `.env.local` file ignored by git and pass URLs through `window.HYPERTEXT_BACKEND_URL` in the demo pages.
- Prioritizing using codex to review and critique your plans