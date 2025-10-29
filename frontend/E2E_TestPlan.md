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
- **Title**: User searches music and opens track details (feature)
- **Preconditions**: Demo catalogue seeded; user authenticated; search API mock responds with fixture tracks
- **Steps**:
  1. Navigate to `/`
  2. Enter keyword `lofi` into global search and submit
  3. Wait for result grid to render
  4. Click first card (MusicCard component)
  5. Verify track modal shows metadata (title, artist, lyric preview)
  6. Trigger `Add to favourites` and confirm toast feedback
- **Expected**: Search results list appears with at least one item; modal displays full track details; favourites interaction updates UI state without errors.

## Open Questions
- Confirm availability of Google OAuth sandbox credentials for automated flows.
- Determine API mocking strategy for setup wizard and search endpoints in CI (MSW vs. service worker stubs).
- Clarify acceptance criteria for favourites persistence prior to automating Scenario E2E-004.
