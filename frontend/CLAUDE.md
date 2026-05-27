# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start        # Dev server on localhost:5173
npm run build        # Production build to build/
npm run lint         # ESLint (0 warnings allowed)
npm run preview      # Preview production build
npm run tunnel       # Expose via vk-tunnel for device testing
npm run deploy       # Build + deploy to VK hosting
```

No test suite is configured.

## Architecture

VK Mini App for VK group analysis and AI-powered content generation. Built with React 18, Vite, VKUI component library, and Zustand for state.

**Entry chain:** `index.html` → `src/main.js` (VK Bridge init, React root) → `src/AppConfig.jsx` (platform config, ConfigProvider/AdaptivityProvider wrappers) → `src/App.jsx` (routing logic and top-level state)

### Navigation

Uses `@vkontakte/vk-mini-apps-router` (hash-based) defined in `src/routes.js`, but panel navigation in `App.jsx` is driven by local state (`activeStory`, `auditPanel`, `contentPanel`) rather than the router directly. The router provides `useRouteNavigator` hooks; state is passed as props down to panels.

Panels in `src/panels/`:
- `EnterMenu.jsx` — main menu, choose between audit or content generation
- `Auth.jsx` — VK Bridge auth flow to obtain group access token
- `Home.jsx` — lists user's VK groups (subscribed/administered), search
- `AnalysedGroup.jsx` — group audit view
- `ContentGenerating.jsx` — content generation hub with balance display and tab switching
- `PostsGenerator.jsx` — prompt + image upload form for posts/images generation
- `PastGenerations.jsx` — history of generated content with copy/download

### State Management

Single Zustand store at `src/stores/useGenerationStore.js`. Manages:
- Token balance and subscription status (`isDonut`)
- Active generation task with polling (`startPolling` every 3 seconds via `setInterval`)
- UI state: `tabType`, `prompt`, `message`, `error`
- Generation history (`generationHistory`)

Call `checkAndStartPolling()` on app mount to resume polling if a task is already in progress.

### API Layer

`src/api/axiosInstance.js` — Axios client, base URL `https://vk.wonderrfau1t.site/api/v1`, 10s timeout.

`src/services/generationService.js` — all backend calls. Every request includes `X-VK-Launch-Params` header (obtained via `bridge.send('VKWebAppGetLaunchParams')`).

Key endpoints:
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/generator/generate` | Create task (FormData) |
| GET | `/generator/tasks` | Check for active task |
| GET | `/generator/tasks/{taskId}` | Poll task status |
| GET | `/generator/history?task_type=…` | Fetch generation history |
| GET | `/generator/balance` | User token balance |

### VK Bridge Usage

- `VKWebAppInit` — app initialization
- `VKWebAppGetAuthToken` — request group access token (App ID: `52612592`, scope: `"groups"`)
- `VKWebAppCheckAllowedScopes` — check permissions before auth
- `VKWebAppCallAPIMethod` — call VK API (`groups.get`, `groups.search`)
- `VKWebAppGetLaunchParams` — get params for backend auth header
- `VKWebAppOpenExternalLink` / `VKWebAppDownloadFile` — mobile download fallbacks

### Vite Config Notes

- Base path is `./` (relative) for VK hosting compatibility
- `.js` files are treated as JSX via a custom plugin
- `@vkontakte/icons` has "use client" directives stripped by another custom plugin
- Dev server allows `*.wonderrfau1t.site` origins for tunnel testing

### UI Text

All UI-facing strings are in Russian.
