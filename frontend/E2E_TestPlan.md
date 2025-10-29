# E2E Test Plan — MUSE MUSIC

## Overview
- **Framework**: Playwright v1.40 running on Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari  
- **Target Sprint Feature**: Onboarding Setup Wizard & Music Discovery
- **Auth Focus**: Google OAuth entry points and protected account area
- **Data Strategy**: Use seed fixtures for UI assertions; mock auth/session tokens via Playwright storage states when deeper flows are automated in later sprints.

## Scenarios

### Scenario ID: E2E-001
- **Title**: User completes Google Sign-In and lands on account dashboard
- **Preconditions**: Google OAuth test credentials active; backend auth callback reachable; Playwright storage state cleared
- **Steps**:
  1. Open `/`
  2. Click `Sign in with Google`
  3. Complete Google OAuth flow in popup (use test credential)
  4. Wait for redirect back to `/account`
  5. Verify top navigation shows logged-in user name and avatar placeholder
  6. Confirm dashboard widgets (stats, favourites, recommendations) start loading
- **Expected**: Authenticated session is stored; account dashboard renders without redirects; toast confirms successful login.

### Scenario ID: E2E-002
- **Title**: Protected account page redirects unauthenticated visitor (negative)
- **Preconditions**: No auth tokens in storage; test user logged out
- **Steps**:
  1. Open `/account` directly
  2. Intercept redirect events
  3. Wait for navigation completion
  4. Observe toast copy requesting login
  5. Check URL is `/login`
  6. Assert login form inputs are visible
- **Expected**: Unauthorized access triggers toast and forced redirect to `/login` within 2 seconds; no account content flashes on screen.

### Scenario ID: E2E-003
- **Title**: First-time user completes Setup Wizard steps (feature)
- **Preconditions**: Fresh account created; `setupCompleted=false` in fixtures; user already authenticated
- **Steps**:
  1. Launch `/setup/step1`
  2. Fill language & region selections then click `Next`
  3. On step 2 choose preferred genres and continue
  4. On step 3 opt in to recommendation preferences, proceed
  5. On step 4 review summary and click `Finish setup`
  6. Ensure redirect to `/for-you` with success toast
- **Expected**: Wizard persists selections, enables `Next` buttons only after required fields; completion flag stored (verify via API or localStorage); landing page personalized banner visible.

### Scenario ID: E2E-004
- **Title**: Search/Recommendation card navigation
- **Preconditions**: Recommendation section renders (fixtures) on `/test`. Detail page not implemented yet.
- **Steps (current)**:
  1. Open `/test`
  2. Wait for recommendation list (MusicCard)
  3. Click the first card link (`/songs/:id`)
  4. Verify navigation to `/songs/:id`
  5. Assert global NotFound page appears (until detail page is built)
- **Expected (current)**: Navigates to `/songs/:id` and shows NotFound content.
- **Steps (future upgrade)**:
  - On detail page, verify metadata (title/artist/lyric preview)
  - Click `Add to favourites` and validate toast/UI state

### Scenario ID: E2E-005
- **Title**: User logs out from account page
- **Preconditions**: User authenticated and on `/account`
- **Steps**:
  1. Click `Logout` button on `/account`
  2. Observe success toast
  3. Wait for redirect to `/`
  4. Verify navbar shows `Sign in` button
- **Expected**: Toast shows “Logged out successfully!” and app redirects to home; session cleared and navbar returns to unauthenticated state.

## Open Questions
- Confirm availability of Google OAuth sandbox credentials for automated flows.
- Determine API mocking strategy for setup wizard and search endpoints in CI (MSW vs. service worker stubs).
- Clarify acceptance criteria for favourites persistence prior to automating Scenario E2E-004.

## Implementation Status (now vs. planned)
- E2E-001 (Login happy path, mocked): Implemented — storage-state/localStorage auth, asserts account UI
- E2E-002 (Protected redirect): Implemented — spec exists and passes
- E2E-003 (Setup wizard): Implemented — stubs API, completes steps 1→4
- E2E-004 (Search + favourites): Planned — pending feature wiring; current plan will mock API and assert add-to-favourites
- E2E-005 (Logout): Implemented — asserts redirect to home and navbar unauthenticated

## Additional Scenarios (Implemented)

### Scenario ID: E2E-006
- **Title**: Navigation and responsive menu
- **Preconditions**: App running with Navbar visible
- **Steps**:
  1. Open `/`
  2. Verify navbar links (Home, For you, Archive) and search box
  3. Navigate to `/login` then `/register` using links
  4. Switch to mobile viewport and open hamburger menu; verify same items
- **Expected**: Links and search render correctly; navigation works on desktop and mobile menu.

### Scenario ID: E2E-007
- **Title**: Authentication pages show required UI elements
- **Preconditions**: Unauthenticated state
- **Steps**:
  1. Open `/login`; verify username/password inputs and submit button
  2. Verify presence of Google sign-in button
  3. Open `/register`; verify username/password/confirmPassword and submit button
- **Expected**: Required inputs and actions are visible on both pages.

### Scenario ID: E2E-008
- **Title**: Form validation for login/register (negative)
- **Preconditions**: Unauthenticated state
- **Steps**:
  1. On `/login`, submit empty form; remain on `/login` and inputs stay visible
  2. On `/register`, verify submit disabled until fields valid; enter mismatched/invalid passwords and assert errors/disabled state
- **Expected**: Validation prevents submission and surfaces proper UI feedback.

## Traceability (specs ↔ scenarios)
- Protected redirect (E2E-002): `frontend/tests/auth/protected-route.spec.ts`
- Login happy path (E2E-001): `frontend/tests/auth/login-mock.spec.ts`
- Form validation (supports E2E-004): `frontend/tests/forms/form-validation.spec.ts`
- Auth UI presence (supports E2E-001 prechecks): `frontend/tests/authentication/auth-elements.spec.ts`
- Navigation/Responsive (supporting flows): `frontend/tests/navigation/navigation.spec.ts`
- Setup wizard (E2E-003): `frontend/tests/setup/wizard.spec.ts`
- Logout (E2E-005): `frontend/tests/auth/logout.spec.ts`
