# Frontend Code Review — Cinema Reservation App

> Reviewed: 2026-02-28

---

## 1. SECURITY

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **Critical** | `utils/axios.ts` | 7 | **Hardcoded API URL** — `baseURL: "http://localhost:3000"` is hardcoded. Use `import.meta.env.VITE_API_URL` so it works across environments. |
| **High** | `router/index.ts` | 27 | **"Secret" admin route** — `/secret-admin` is security through obscurity; the path is discoverable in the JS bundle. Route guards are the real protection, but the naming gives a false sense of security. |
| **High** | `components/RegisterForm.vue` | 91 | **Logging sensitive data** — `console.log("Form submitted:", form)` logs user credentials (including password) to the console. Remove immediately. |
| **Medium** | `stores/auth.ts` | 14 | **`setUser(user: any)`** — No type validation on data from the server. Malicious or malformed server responses are accepted blindly. |
| **Medium** | `utils/axios.ts` | 14–20 | **Global 401 redirect** — All 401s redirect to `/login`, even for admin users who should go to `/secret-admin`. Also redirects during the initial `initSession()` call, which can cause a flash to login. |

---

## 2. PERFORMANCE

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **High** | `plugins/vuetify.js` | 3–4 | **Full Vuetify import** — `import * as components` and `import * as directives` imports the entire Vuetify library (~500KB). Use `vite-plugin-vuetify` with automatic tree-shaking or import only used components. |
| **High** | `vite.config.js` | 6 | **`vite-plugin-vuetify` not used** — The package is in `package.json` but not used in the Vite config, so Vuetify tree-shaking and automatic component imports are disabled. |
| **Medium** | `package.json` | 17–18 | **`sass` and `vite-plugin-vuetify` in `dependencies`** — Both are build-time tools and should be in `devDependencies`. |
| **Medium** | `components/SessionList.vue` | 170–175 | **Non-reactive `isMobile` computed** — `window.innerWidth` is read once; the value never updates on resize. |
| **Low** | `composables/index.js` | 13–14 | **Unused VueUse imports** — `useFetch` and `useAsyncState` are imported but never used. Dead code shipped to clients. |

---

## 3. VUE BEST PRACTICES

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **High** | Multiple files | — | **Mixed Options API / Composition API** — `Navbar.vue`, `SessionCard.vue`, `SessionDetailsModal.vue`, `BookingSummary.vue`, `DateFilter.vue`, `App.vue` etc. use Options API. `LoginForm.vue`, `RegisterForm.vue`, `Profile.vue`, admin views use `<script setup>`. Pick one. |
| **High** | `components/Navbar.vue` | 82–84 | **Anti-pattern: assigning composables to `this`** — `this.auth = useAuthStore()` in `created()` is incorrect. Composables must be called in `setup()`. |
| **High** | `App.vue` | 4–16 | **Root component uses Options API** — Uses `mounted()` instead of `<script setup>` with `onMounted()`. |
| **Medium** | `components/SessionCard.vue` | 122 | **Untyped prop** — `session` prop is `type: Object` instead of using the `Session` interface. |
| **Medium** | `main.js` | — | **No global error handler** — Missing `app.config.errorHandler`. |
| **Medium** | `components/SeatGrid.vue` | 50–55 | **Verbose `setup()` in Options API wrapper** — Uses `export default { setup() {} }` instead of `<script setup>`. |
| **Low** | `components/LoginForm.vue` | 41 | **`<a href="/login">` instead of `<router-link>`** — Causes full page reload. Same in `RegisterForm.vue` L72. |

---

## 4. STATE MANAGEMENT

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **High** | `stores/reservations.ts` vs `stores/movies.ts` | — | **Mixed store patterns** — Options API stores vs Setup stores. Pick one. |
| **High** | `components/MyReservations.vue` | 370 | **Incorrect store call** — `cancelReservation(id, { expectedVersion })` passes 2 args, but action accepts only 1. OCC version data is silently dropped. |
| **Medium** | `stores/reservations.ts` | 91–100 | **Broken legacy `book()` method** — Creates sequential seat numbers `[1, 2, ..., seats]` starting from 1 regardless of availability. |
| **Medium** | `stores/reservations.ts` | 8 | **`user?: any`** — Loses all type safety. |

---

## 5. API / HTTP

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **High** | `utils/axios.ts` | 7 | **No environment variable for API URL** — Deployment blocker. |
| **Medium** | All stores | — | **No request cancellation** — No `AbortController` usage; race conditions possible. |
| **Medium** | `views/admin/AdminSessionList.vue` | 208 | **Dynamic import of axios** — `import('../../utils/axios').then(...)` instead of static import. |
| **Low** | `composables/index.js` | 155–160 | **`useFetch` inconsistency** — Doesn't send cookies, inconsistent with axios `withCredentials: true`. |

---

## 6. ACCESSIBILITY

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **High** | `components/SessionDetailsModal.vue` | 1–4 | **Custom modal missing ARIA** — No `role="dialog"`, `aria-modal="true"`, or `aria-labelledby`. Same in `SeatModificationModal.vue`. |
| **High** | `components/SessionDetailsModal.vue` | — | **No focus trap** — Tab focus escapes to background content. |
| **Medium** | `components/Navbar.vue` | 48 | **Hamburger missing a11y** — No `aria-label`, `aria-expanded`, or `role="button"`. |
| **Medium** | `components/SeatingArea.vue` | 66–72 | **Seat buttons missing `aria-label`** — No `aria-pressed` for screen readers. |
| **Medium** | `App.vue` | — | **No skip-to-content link**. |
| **Low** | `index.html` | 8 | **Generic page title** — `<title>Vite + Vue</title>`. |

---

## 7. TYPESCRIPT / TYPE SAFETY

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **High** | Multiple | — | **Mixed `.js` and `.ts` files** — `main.js`, `composables/index.js`, `utils/icons.js`, `utils/seatUtils.js`, `plugins/vuetify.js` are plain JS. All should be `.ts`. |
| **Medium** | Most `.vue` files | — | **Missing `lang="ts"`** — TypeScript checking is skipped. |
| **Medium** | `utils/seatUtils.js` | 178 | **Unused parameter** — `getReservationStatus(session, reservation)` never uses `reservation`. |
| **Low** | `components/SeatingArea.vue` | 114 | **Unused import** — `mdiDoor` imported but never used. |

---

## 8. CODE ORGANIZATION

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **High** | `router/index.ts` | — | **Components used as views** — `LoginForm.vue`, `RegisterForm.vue`, `SessionList.vue`, `SeatGrid.vue`, `MyReservations.vue`, `Profile.vue` are in `components/` but are route-level views. |
| **Medium** | `components/AdminDashboard.vue` | All (576 lines) | **Dead code** — Static hardcoded dashboard with fake data. Not in any route. Delete. |
| **Medium** | `components/SessionForm.vue` | All | **Dead code** — No bindings, no submit handler. Not used. |
| **Medium** | `components/HelloWorld.vue` | All | **Dead code** — Default Vite scaffold. Not used. |
| **Medium** | `components/SeatLegend.vue` | All | **Dead/duplicate code** — Already in `SeatingArea.vue`. Not imported anywhere. |
| **Medium** | Multiple | — | **Duplicated formatting** — `formatTime`, `formatDate`, `formatPrice` reimplemented in 5+ files. Extract to utility. |
| **Medium** | `SessionCard.vue` + `SessionDetailsModal.vue` | — | **Duplicated `getMovieDescription()`** — Identical map in two files. |
| **Low** | Multiple | — | **Oversized components** — `MyReservations.vue` (1170 lines), `SeatingArea.vue` (764), `SessionList.vue` (622). |

---

## 9. CSS / STYLING

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **High** | `App.vue` | 28–166 | **Global unscoped styles** — `.btn`, `.mt-1`, `.mb-2` etc. conflict with Vuetify. |
| **Medium** | Multiple | — | **`!important` abuse** — `style.css`, `SessionList.vue`, `AdminLayout.vue`, `AdminDashboard.vue`. |
| **Medium** | `App.vue` + `style.css` | — | **Conflicting global styles** — Both define `*`, `#app`, `body` styles. |
| **Medium** | Many components | — | **Duplicated `.btn` styles** — Copy-pasted in 6+ components. Use Vuetify's `<v-btn>`. |
| **Medium** | Multiple | — | **Hardcoded colors** — `#007bff`, `#28a745`, `#dc3545` instead of theme tokens. |
| **Low** | `views/admin/AdminLayout.vue` | 200 | **Deprecated Sass `lighten()`** — Use `color.adjust()`. |

---

## 10. ROUTER

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **Medium** | `router/index.ts` | 104–107 | **Silent 404** — Catch-all redirects to `/sessions` instead of showing a 404 page. |
| **Medium** | `router/index.ts` | 41–45 | **Route/prop type mismatch** — `props: true` sends string `id`, but `SeatGrid.vue` expects `sessionId` as Number. |
| **Low** | `router/index.ts` | — | **No route-level loading indicator**. |

---

## 11. INTERNATIONALIZATION

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **Medium** | `views/admin/AdminSessionForm.vue` | All | **Polish UI** mixed with English app. |
| **Medium** | `views/admin/AdminSessionList.vue` | 243–247 | **Inconsistent locale/currency** — `pl-PL` / PLN vs `en-US` / `$`. |
| **Medium** | `components/MyReservations.vue` | 265–290 | **Polish error messages** mixed with English code. |

---

## 12. MISCELLANEOUS

| Severity | File | Line(s) | Issue |
|----------|------|---------|-------|
| **Medium** | `MyReservations.vue` + `SeatModificationModal.vue` | — | **`alert()` / `confirm()`** instead of Vuetify dialogs. |
| **Medium** | `components/SeatGrid.vue` | 116–117 | **Sending unnecessary data** — `customerName`/`customerEmail` from frontend = data spoofing vector. |
| **Low** | `index.html` | 8 | **Default page title**. |
| **Low** | `package.json` | 2 | **Generic package name** — `"frontend"`. |
| **Low** | Multiple | — | **15+ `console.error`/`console.warn`** in production code. |
| **Low** | `components/LoginForm.vue` | 56–58 | **Error ref set but never rendered** in template. |

---

## Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security | 1 | 2 | 2 | 0 | **5** |
| Performance | 0 | 2 | 2 | 1 | **5** |
| Vue Best Practices | 0 | 3 | 2 | 1 | **6** |
| State Management | 0 | 2 | 2 | 0 | **4** |
| API/HTTP | 0 | 1 | 2 | 1 | **4** |
| Accessibility | 0 | 2 | 3 | 1 | **6** |
| TypeScript | 0 | 1 | 2 | 1 | **4** |
| Code Organization | 0 | 1 | 5 | 1 | **7** |
| CSS/Styling | 0 | 1 | 4 | 1 | **6** |
| Router | 0 | 0 | 2 | 1 | **3** |
| i18n | 0 | 0 | 3 | 0 | **3** |
| Misc | 0 | 0 | 2 | 4 | **6** |
| **Total** | **1** | **15** | **31** | **12** | **59** |

### Top 8 Priorities

1. Remove `console.log` of credentials in `RegisterForm.vue`
2. Use environment variable for API base URL
3. Enable Vuetify tree-shaking via `vite-plugin-vuetify` in Vite config
4. Fix the Navbar composable anti-pattern (composables in `created()`)
5. Fix the broken OCC version param being dropped in `cancelReservation`
6. Add ARIA attributes to custom modals
7. Delete dead code components (`HelloWorld`, `AdminDashboard`, `SessionForm`, `SeatLegend`)
8. Standardize on Composition API with `<script setup lang="ts">` throughout