# Software Requirements Specification (SRS)
## WOM Frontend Engineer Technical Test — React Native Mobile Application

| Field | Value |
|---|---|
| Document Type | Software Requirements Specification (IEEE 830 Inspired) |
| Project | WOM React Native Technical Test |
| Version | 1.0 |
| Status | Draft for Implementation |
| Date | 2026-04-28 |
| Audience | Frontend Engineer (Candidate), Technical Reviewer, Hiring Panel |

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for a React Native mobile application built as part of the WOM Frontend Engineer technical assessment. The document serves as the contract between the candidate (implementer) and the WOM technical reviewers, providing unambiguous, testable criteria against which the deliverable will be evaluated.

### 1.2 Scope
The system to be developed is a **cross-platform mobile application** ("the App") that demonstrates the candidate's proficiency in React Native frontend engineering. The App **shall**:

- Authenticate a user via email and password.
- Persist an authentication token securely on device.
- Fetch and display a list of resources from a public REST API.
- Allow the user to view item details on a dedicated screen.
- Demonstrate reusable component design, error handling, and modern UX patterns (loading, empty, error, dark mode).

The App **shall not**:

- Implement a real production user database or backend authentication server.
- Implement push notifications, analytics, deep linking, payment, or social features.
- Support offline-first synchronization (online connectivity is assumed during use).
- Implement role-based access control beyond the binary authenticated / unauthenticated distinction.

### 1.3 Definitions, Acronyms, Abbreviations

| Term | Definition |
|---|---|
| App | The deliverable React Native mobile application |
| API | Application Programming Interface |
| AsyncStorage | React Native's key-value persistent storage primitive |
| Axios | Promise-based HTTP client for JavaScript |
| FlatList | React Native's performant scrollable list component |
| JWT | JSON Web Token — a compact, URL-safe token format (RFC 7519) |
| REST | Representational State Transfer architectural style |
| RN | React Native |
| SRS | Software Requirements Specification |
| UX/UI | User Experience / User Interface |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |

### 1.4 References

| # | Reference | URL / Source |
|---|---|---|
| R-1 | Original technical test brief | `technical_test_requirement.md` |
| R-2 | React Navigation documentation | https://reactnavigation.org/docs |
| R-3 | Axios documentation | https://axios-http.com/docs/intro |
| R-4 | JSONPlaceholder public API | https://jsonplaceholder.typicode.com |
| R-5 | DummyJSON public API | https://dummyjson.com |
| R-6 | AsyncStorage documentation | https://react-native-async-storage.github.io/async-storage |
| R-7 | JWT specification | RFC 7519 |
| R-8 | IEEE Std 830-1998 | IEEE Recommended Practice for SRS |

### 1.5 Overview
Section 2 provides the broad product context (perspective, users, environment, constraints). Section 3 enumerates the specific functional and non-functional requirements, screen and API interfaces, and data models. Section 4 contains the Verification Matrix used for acceptance testing. Each requirement is uniquely identified (FR-NNN / NFR-X-NNN) and traceable to an acceptance test in Section 4.

---

## 2. Overall Description

### 2.1 Product Perspective
The App is a self-contained, client-only mobile product. It does not extend an existing system; it consumes a third-party public REST API (e.g., DummyJSON or JSONPlaceholder) to simulate a real backend. Authentication is mocked locally — there is no real identity provider — but the storage and lifecycle of the auth token must mirror production patterns.

### 2.2 Product Functions
At the highest level, the App provides:

- Email/password authentication with client-side validation.
- Secure persistence of an authentication token across app restarts.
- Authenticated browsing of a remote resource list with pull-to-refresh.
- Navigation to a detail screen for any selected list item.
- Consistent feedback states: loading, empty, error.
- Theme-aware styling (light/dark mode).

### 2.3 User Classes and Characteristics

| User Class | Description | Privileges |
|---|---|---|
| **Guest (Unauthenticated)** | A user who has launched the App but has no valid stored token. | May only view the Login screen. |
| **Authenticated User** | A user who has successfully logged in; a valid token exists in secure storage. | May view Home, Detail, and trigger Logout. |

The reviewer's persona is technical: familiar with React Native conventions, evaluating both visible behavior and source code quality.

### 2.4 Operating Environment

| Aspect | Specification |
|---|---|
| Framework | React Native ≥ 0.73 (or latest stable at submission) |
| Language | TypeScript (preferred) or JavaScript (ES2020+) |
| Target Platforms | iOS ≥ 15 and Android API ≥ 26 (Android 8.0) |
| Device Form Factors | Smartphones, portrait orientation, 360dp–430dp width |
| Network | HTTPS connectivity to public APIs |
| Tooling | Node.js ≥ 18, Yarn or npm, Xcode (iOS), Android Studio (Android) |

### 2.5 Design and Implementation Constraints

| ID | Constraint |
|---|---|
| C-01 | The App **shall** be built with React Native. |
| C-02 | Navigation **shall** be implemented using React Navigation (R-2). |
| C-03 | All HTTP calls **shall** be performed via Axios (R-3). |
| C-04 | All asynchronous operations **shall** use `try/catch` for error handling. |
| C-05 | Components **shall** be modular and reusable; the list-item component on Home **must** be reused at the top of the Detail screen. |
| C-06 | The auth token **shall** be persisted using AsyncStorage (or a more secure equivalent such as `react-native-keychain` / `expo-secure-store`). |
| C-07 | The project **shall** be pushed to a public GitHub repository with **at least 3 commits**, each commit logically scoped (e.g., one per screen/feature). |
| C-08 | The codebase **shall** avoid hard-coded secrets; any API base URL **should** live in a config or `.env` file. |

### 2.6 Assumptions and Dependencies

| ID | Assumption / Dependency |
|---|---|
| A-01 | The chosen public API (DummyJSON, JSONPlaceholder, or equivalent) is reachable and rate-limit-tolerant during testing. |
| A-02 | The reviewer has Node.js, Yarn/npm, and a configured iOS or Android emulator available. |
| A-03 | Internet connectivity is available on the test device. |
| A-04 | If JWT generation is implemented client-side, the signing secret is for demonstration purposes only and is not a real security boundary. |

---

## 3. Specific Requirements

### 3.1 Functional Requirements

---

**FR-001: User Login with Email and Password**
- **Description:** The App shall provide a Login screen that accepts an email address and a password.
- **Priority:** Must
- **Input:** Email string, password string entered by the user; tap on "Login" button.
- **Processing:** Validate inputs (FR-002). If valid, generate or obtain an authentication token (FR-003), persist it (FR-004), and navigate to Home.
- **Output:** On success, navigation to the Home screen. On failure, an inline error message describing the cause.
- **Error Handling:** Wrap all async operations in `try/catch`. Display user-friendly messages for: empty fields, invalid email format, password length violation, token generation failure, storage failure.
- **Acceptance Criteria:**
  - [ ] Given the App is launched and no token is stored, when the user opens the App, then the Login screen is displayed.
  - [ ] Given valid credentials, when the user taps "Login", then the user is navigated to Home within 2 seconds.
  - [ ] Given invalid credentials or validation errors, when the user taps "Login", then an inline error is displayed and no navigation occurs.

---

**FR-002: Login Form Input Validation**
- **Description:** The App shall validate the email and password fields before submission.
- **Priority:** Must
- **Input:** Email and password field values.
- **Processing:** Check email matches RFC 5322 simplified regex; password length ≥ 6 characters; neither field empty.
- **Output:** Inline validation messages adjacent to the offending field; "Login" button disabled or no-op when invalid.
- **Error Handling:** Validation failures shall not throw; they shall produce non-blocking UI hints.
- **Acceptance Criteria:**
  - [ ] Given an empty email, when the user attempts to log in, then "Email is required" is shown.
  - [ ] Given an email like `foo@bar`, when the user attempts to log in, then "Invalid email format" is shown.
  - [ ] Given a password shorter than 6 characters, when the user attempts to log in, then "Password must be at least 6 characters" is shown.

---

**FR-003: Authentication Token Generation**
- **Description:** Upon successful validation, the App shall produce an authentication token using one of the approved schemes.
- **Priority:** Must
- **Input:** Validated email (and password, depending on scheme).
- **Processing:** Implement **one** of:
  1. Random opaque string (e.g., 32+ char base64).
  2. **Recommended:** Locally signed JWT containing `{ email, iat, exp }` with `exp = iat + 3600` (1 hour).
  3. Google OAuth flow returning a real `access_token`.
- **Output:** A token string ready for persistence.
- **Error Handling:** Any failure in token creation shall surface a "Login failed, please try again" message.
- **Acceptance Criteria:**
  - [ ] Given a successful login, when token generation completes, then the token is non-empty.
  - [ ] Given JWT scheme is used, when the token is decoded, then it contains an `exp` claim ≤ 1 hour ahead of `iat`.

---

**FR-004: Secure Token Persistence**
- **Description:** The App shall persist the authentication token across app restarts.
- **Priority:** Must
- **Input:** Token string from FR-003.
- **Processing:** Write to AsyncStorage under a namespaced key (e.g., `@wom/auth_token`). Optionally use `react-native-keychain` or `expo-secure-store` for stronger isolation.
- **Output:** Persisted token retrievable on next app launch.
- **Error Handling:** Storage write failure shall block navigation and surface an error.
- **Acceptance Criteria:**
  - [ ] Given a logged-in user, when the App is killed and relaunched, then the user is taken directly to Home (token still valid).
  - [ ] Given a JWT whose `exp` has passed, when the App launches, then the user is redirected to Login and the expired token is purged.

---

**FR-005: Logout**
- **Description:** The App shall provide a way for an authenticated user to log out from the Home screen.
- **Priority:** Should
- **Input:** Tap on "Logout" affordance.
- **Processing:** Remove the token from storage; reset navigation stack to Login.
- **Output:** User returned to Login screen with empty form.
- **Error Handling:** Storage delete failure shall be logged and the user navigated to Login regardless.
- **Acceptance Criteria:**
  - [ ] Given an authenticated user on Home, when the user taps "Logout", then the user is navigated to Login.
  - [ ] Given a logged-out user, when the App is relaunched, then the Login screen is displayed.

---

**FR-006: Display Authenticated User's Email on Home**
- **Description:** The Home screen shall prominently display the email address used to log in.
- **Priority:** Must
- **Input:** Email retrieved from auth state (decoded JWT or persisted alongside token).
- **Processing:** Render email in header or banner area of Home.
- **Output:** Visible email string on Home screen.
- **Error Handling:** If email cannot be retrieved, display a fallback like "Welcome" without crashing.
- **Acceptance Criteria:**
  - [ ] Given the user logged in with `user@example.com`, when Home renders, then `user@example.com` is visible.

---

**FR-007: Fetch and Display Resource List on Home**
- **Description:** The Home screen shall fetch a list of resources from a public REST API and render them in a `FlatList`.
- **Priority:** Must
- **Input:** Home screen mount or pull-to-refresh trigger.
- **Processing:** Issue a `GET` request via Axios to the configured endpoint (e.g., `https://dummyjson.com/products`). On success, store response in state and render via `FlatList`.
- **Output:** Scrollable list of items rendered through a reusable list-item component.
- **Error Handling:** `try/catch` around the Axios call; on failure, render the Error State (FR-010).
- **Acceptance Criteria:**
  - [ ] Given network connectivity, when Home mounts, then a list of ≥ 1 item renders within 3 seconds.
  - [ ] Given a 5xx response, when Home mounts, then the Error State is rendered with a retry action.
  - [ ] Each list item shall be rendered by a single, reusable component (used again in Detail per FR-012).

---

**FR-008: Pull-to-Refresh on Home**
- **Description:** The Home FlatList shall support pull-to-refresh.
- **Priority:** Must
- **Input:** User performs a downward pull gesture at the top of the list.
- **Processing:** Re-issue the list fetch from FR-007; show the standard `RefreshControl` spinner during the request.
- **Output:** Refreshed data replaces the existing list; spinner dismisses on completion.
- **Error Handling:** On error, retain prior data, dismiss spinner, surface a non-blocking toast/banner.
- **Acceptance Criteria:**
  - [ ] Given the list is rendered, when the user pulls down, then the spinner appears and a new fetch is triggered.
  - [ ] Given the refresh fails, when the spinner dismisses, then the previously displayed items remain visible.

---

**FR-009: Loading State**
- **Description:** All asynchronous data screens shall display a loading indicator while requests are in flight.
- **Priority:** Must
- **Input:** Fetch initiation (initial mount, refresh, navigation to Detail).
- **Processing:** Toggle `isLoading` state; render `ActivityIndicator` or skeleton.
- **Output:** Visible loading affordance until data arrives or error occurs.
- **Error Handling:** Loading state shall always terminate (success or error); no infinite spinners.
- **Acceptance Criteria:**
  - [ ] Given Home or Detail is mounting, when the request is in flight, then a loading indicator is visible.
  - [ ] Given the request resolves, when state updates, then the loading indicator disappears.

---

**FR-010: Error State**
- **Description:** The App shall present a clear error state when remote calls fail.
- **Priority:** Must
- **Input:** Axios call rejected (network, 4xx, 5xx).
- **Processing:** Catch the error, log to console (dev), set `error` state, render an Error component.
- **Output:** Error illustration/icon, human-readable message, "Retry" button.
- **Error Handling:** Retry shall re-invoke the original request; never crash.
- **Acceptance Criteria:**
  - [ ] Given the device is offline, when Home loads, then the Error State is displayed with a Retry button.
  - [ ] Given the user taps Retry, when connectivity is restored, then the data loads normally.

---

**FR-011: Navigate to Detail Screen**
- **Description:** Tapping any item in the Home FlatList shall navigate to the Detail screen for that item.
- **Priority:** Must
- **Input:** Tap on a list item.
- **Processing:** Use React Navigation `navigate('Detail', { item, id })` to pass the item via route params.
- **Output:** Detail screen mounts and displays the selected item.
- **Error Handling:** If the item param is missing or malformed, render the Empty State (FR-013).
- **Acceptance Criteria:**
  - [ ] Given the list is rendered, when the user taps an item, then the Detail screen opens for that item.
  - [ ] Given the user taps the back button on Detail, then they return to Home with scroll position preserved.

---

**FR-012: Detail Screen with Reusable Top Component**
- **Description:** The Detail screen shall render the selected item using the **same** list-item component used on Home, placed at the top of the screen, followed by extended detail content.
- **Priority:** Must
- **Input:** Route params from FR-011 (and optionally an item ID for refetch).
- **Processing:** Render reusable component at top; if a detail endpoint is available, fetch full data via Axios; otherwise hydrate from route params.
- **Output:** A Detail layout where the list-item summary anchors the screen and additional fields appear below.
- **Error Handling:** Loading (FR-009), error (FR-010), and empty (FR-013) states all apply.
- **Acceptance Criteria:**
  - [ ] Given navigation from Home, when Detail mounts, then the same list-item component visible on Home renders at the top of Detail.
  - [ ] Given a successful detail fetch, when data resolves, then extended fields (description, etc.) render below the reusable component.
  - [ ] Given the API is unreachable but route params exist, then Detail renders from props with a non-blocking notice.

---

**FR-013: Empty State Handling**
- **Description:** When a request resolves successfully but returns no usable data, the App shall display an Empty State.
- **Priority:** Must
- **Input:** Successful response with empty array / null payload.
- **Processing:** Detect empty payload; render Empty component (icon + message).
- **Output:** "No items to show" placeholder.
- **Error Handling:** N/A — this is a success path with no data.
- **Acceptance Criteria:**
  - [ ] Given the API returns an empty list, when Home renders, then the Empty State is shown.
  - [ ] Given the Detail endpoint returns 404 or null, when Detail renders, then the Empty State is shown.

---

### 3.2 Non-Functional Requirements

#### Performance

| ID | Requirement |
|---|---|
| NFR-P-001 | App cold start to first interactive screen **shall** be < 3 seconds on a mid-range Android device (e.g., Pixel 5 or equivalent). |
| NFR-P-002 | List rendering of ≤ 100 items in `FlatList` **shall** complete within 1 second after data arrival. |
| NFR-P-003 | Scroll on Home **shall** sustain ≥ 55 fps on devices with ≥ 2GB RAM. |
| NFR-P-004 | The reusable list-item component **shall** be memoized (`React.memo`) and use stable `keyExtractor` to avoid unnecessary re-renders. |
| NFR-P-005 | Axios requests **shall** have a 10-second timeout to prevent indefinite waits. |

#### Security

| ID | Requirement |
|---|---|
| NFR-S-001 | The auth token **shall** be persisted in AsyncStorage (minimum) or a secure store (preferred); it **shall not** appear in component props passed via deep links or be logged to the console in production builds. |
| NFR-S-002 | Passwords **shall not** be persisted on the device. |
| NFR-S-003 | All network traffic **shall** use HTTPS. |
| NFR-S-004 | If JWT is used, the local signing secret **shall not** be committed to the repository in plaintext (use `.env` and `.gitignore`). |

#### Reliability

| ID | Requirement |
|---|---|
| NFR-R-001 | The App **shall** not crash on any documented user flow (Login, Home, Detail, Logout, Refresh). |
| NFR-R-002 | Every network error **shall** result in a recoverable Error State, never a white screen or silent failure. |
| NFR-R-003 | Token expiration **shall** be detected on app launch and route the user to Login. |

#### Usability

| ID | Requirement |
|---|---|
| NFR-U-001 | All interactive elements (buttons, list items, inputs) **shall** have a minimum touch target of 44×44 dp. |
| NFR-U-002 | The App **shall** support both light and dark modes by responding to the system `Appearance` setting. |
| NFR-U-003 | Text **shall** scale with the system font size setting (no fixed `fontSize` on body copy beyond reasonable bounds). |
| NFR-U-004 | Loading, empty, and error states **shall** each have distinct visual designs; they **shall not** be reused interchangeably. |
| NFR-U-005 | Form fields **shall** show appropriate keyboard types (`email-address` for email, `default` + `secureTextEntry` for password). |

#### Compatibility

| ID | Requirement |
|---|---|
| NFR-C-001 | The App **shall** run on iOS ≥ 15 and Android API ≥ 26. |
| NFR-C-002 | The App **shall** render correctly on screen widths from 360 dp to 430 dp. |
| NFR-C-003 | The App **shall** handle both safe-area insets (notch/Dynamic Island on iOS) and system gesture areas (Android). |

#### Maintainability

| ID | Requirement |
|---|---|
| NFR-M-001 | Source code **shall** follow a consistent style (ESLint + Prettier configured). |
| NFR-M-002 | Folder structure **shall** separate `screens/`, `components/`, `services/` (axios), `navigation/`, `hooks/`, `utils/`, and `types/` (or equivalent). |
| NFR-M-003 | The list-item component **shall** be implemented exactly once and imported in both Home and Detail. |
| NFR-M-004 | Axios **shall** be configured via a single instance (`api.ts`) with a base URL and shared interceptors. |
| NFR-M-005 | The Git history **shall** contain ≥ 3 logically-scoped commits, with descriptive messages (e.g., "feat(auth): add login screen with validation"). |

---

### 3.3 Interface Requirements

#### 3.3.1 Screen Inventory

| Screen Name | Route Key | Description | Accessible To |
|---|---|---|---|
| Login | `Login` | Email/password form with validation and submit. | Guest |
| Home | `Home` | Authenticated landing screen: shows email, list of resources, pull-to-refresh, logout. | Authenticated |
| Detail | `Detail` | Item detail view; reuses Home list-item component at top. | Authenticated |

**Navigation graph:**
- Root: Conditional Stack
  - If no valid token → `Login` (single screen)
  - If valid token → `Home` → `Detail` (Stack Navigator)

#### 3.3.2 External API Interfaces

The implementer **shall** select **one** of the following public APIs (or an equivalent, e.g., RajaOngkir, ProvinsiAPI):

| API | Endpoint | Method | Auth | Notes |
|---|---|---|---|---|
| DummyJSON Products (recommended) | `https://dummyjson.com/products` | GET | None | Returns `{ products: [...] }`. Use `products` array for list. |
| DummyJSON Product Detail | `https://dummyjson.com/products/{id}` | GET | None | Single product object. |
| JSONPlaceholder Users | `https://jsonplaceholder.typicode.com/users` | GET | None | Array of users. |
| JSONPlaceholder User Detail | `https://jsonplaceholder.typicode.com/users/{id}` | GET | None | Single user object. |
| JSONPlaceholder Posts | `https://jsonplaceholder.typicode.com/posts` | GET | None | Array of posts. |

**Required Axios configuration:**

| Aspect | Value |
|---|---|
| `baseURL` | Selected API root (e.g., `https://dummyjson.com`) |
| `timeout` | 10000 ms |
| Headers | `Accept: application/json` |
| Interceptors | Optional: attach auth token, log errors in dev |

#### 3.3.3 Data Models

```
User {
  email: string         (required, RFC 5322)
  token: string         (required, JWT or opaque)
  tokenExpiresAt: number (optional, epoch ms — only when JWT)
}

ListItem {  // example for DummyJSON Products
  id: number            (required)
  title: string         (required)
  description: string   (optional)
  thumbnail: string     (optional, URL)
  price: number         (optional)
  category: string      (optional)
}

DetailItem extends ListItem {
  // All ListItem fields, plus:
  images: string[]      (optional)
  rating: number        (optional)
  stock: number         (optional)
  brand: string         (optional)
}
```

If JSONPlaceholder is selected:

```
ListItem (User) {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
}
```

#### 3.3.4 Component Contract — `<ListItemCard />`

The reusable component required by C-05, FR-007, and FR-012.

| Prop | Type | Required | Description |
|---|---|---|---|
| `item` | `ListItem` | Yes | The data object to render. |
| `onPress` | `(item) => void` | No | Tap handler; if absent, the card is non-interactive (used on Detail top). |
| `variant` | `'list' \| 'header'` | No | Visual variant; defaults to `'list'`. Used to differentiate Home vs. Detail-top rendering. |

---

### 3.4 Data Requirements

| ID | Requirement |
|---|---|
| DR-01 | The auth token **shall** be the only persistent piece of user data. |
| DR-02 | Remote list and detail data **shall not** be persisted; they are re-fetched on each Home mount and Detail mount. |
| DR-03 | Pull-to-refresh **shall** replace, not append, the in-memory list. |
| DR-04 | No PII beyond the entered email **shall** be cached. |

### 3.5 Constraint Requirements (Business / Validation Rules)

| ID | Rule |
|---|---|
| BR-01 | Email **must** match `^[^\s@]+@[^\s@]+\.[^\s@]+$`. |
| BR-02 | Password **must** be ≥ 6 characters. |
| BR-03 | If JWT scheme is used, token TTL **shall** be exactly 1 hour. |
| BR-04 | Logout **must** be irreversible without re-entering credentials. |
| BR-05 | The Detail screen **must not** be reachable when the user is not authenticated (deep-link guard or auth-aware navigator). |

---

## 4. Verification Matrix

Test Methods: **I** = Inspection (code review), **D** = Demonstration (manual), **A** = Analysis (logs, profiler), **T** = Automated Test.

| Req ID | Method | Test Case Description | Pass Criteria |
|---|---|---|---|
| FR-001 | D | Launch app, enter valid email + password, tap Login. | Navigates to Home within 2s. |
| FR-002 | D | Submit empty / invalid email / short password. | Inline error messages shown for each case; no navigation. |
| FR-003 | I, D | Log in; inspect generated token. | Non-empty token; if JWT, decoded payload shows `email`, `iat`, `exp` (`exp - iat == 3600`). |
| FR-004 | D | Log in, force-quit app, relaunch. | Lands on Home (token survived restart). |
| FR-004 | D | Manually expire JWT, relaunch app. | Lands on Login; storage no longer holds token. |
| FR-005 | D | On Home, tap Logout. | Returns to Login; relaunch confirms token cleared. |
| FR-006 | D | After login, observe Home header. | Email used at login is visible. |
| FR-007 | D | Open Home with connectivity. | List renders ≥ 1 item within 3s. |
| FR-007 | D | Disable network, open Home. | Error State renders with Retry. |
| FR-008 | D | Pull down on Home list. | Spinner appears; new fetch issued. |
| FR-008 | D | Pull-to-refresh while offline. | Spinner dismisses; previous data retained; non-blocking error shown. |
| FR-009 | D | Observe Home and Detail during fetch. | Loading indicator visible; disappears on resolution. |
| FR-010 | D | Force a 5xx response (or use offline). | Error State with retry button; tapping retry re-fires request. |
| FR-011 | D | Tap any list item on Home. | Detail opens for that item; back returns to Home with scroll preserved. |
| FR-012 | I, D | Inspect Detail layout and source. | Same `<ListItemCard />` component imported on both Home and Detail; renders at top of Detail. |
| FR-013 | D | Mock empty list response. | Empty State rendered. |
| NFR-P-001 | A | Cold-start measurement on mid-range device. | Time to interactive < 3s. |
| NFR-P-002 | A | Profile FlatList render with 100 items. | Render < 1s after data arrival. |
| NFR-P-003 | A | Scroll Home rapidly; record fps. | ≥ 55 fps sustained. |
| NFR-P-004 | I | Inspect list-item source. | `React.memo` applied; stable `keyExtractor`. |
| NFR-P-005 | I | Inspect Axios config. | `timeout: 10000` set. |
| NFR-S-001 | I | Inspect storage usage and console output. | Token in AsyncStorage/secure store; not logged in production. |
| NFR-S-002 | I | Search source for password persistence. | No password write to storage. |
| NFR-S-003 | I | Inspect API base URLs. | All URLs use `https://`. |
| NFR-S-004 | I | Inspect repo for `.env` / secret leak. | No JWT secret in committed code. |
| NFR-R-001 | D | Run all flows end-to-end. | No crashes. |
| NFR-R-002 | D | Trigger every error path. | Recoverable Error State each time. |
| NFR-R-003 | D | Manually expire JWT, relaunch. | Routed to Login. |
| NFR-U-001 | I | Measure tap targets in design. | All ≥ 44×44 dp. |
| NFR-U-002 | D | Toggle system dark mode. | App theme follows. |
| NFR-U-003 | D | Increase system font size. | Body text scales. |
| NFR-U-004 | I, D | Compare loading vs. empty vs. error. | Three visually distinct designs. |
| NFR-U-005 | D | Focus email vs. password fields. | Correct keyboards / `secureTextEntry` engaged. |
| NFR-C-001 | D | Run on iOS 15 device and Android 8 device. | Works on both. |
| NFR-C-002 | D | Run on 360 dp and 430 dp emulators. | No clipped content. |
| NFR-C-003 | D | Run on a notched iOS device. | Content respects safe area. |
| NFR-M-001 | I | Run ESLint / Prettier. | No errors. |
| NFR-M-002 | I | Inspect folder structure. | Separation as specified. |
| NFR-M-003 | I | Search for list-item component. | Single definition, two import sites. |
| NFR-M-004 | I | Inspect Axios setup. | Single configured instance reused everywhere. |
| NFR-M-005 | I | `git log` review. | ≥ 3 logically-scoped commits with clear messages. |
| C-07 | I | Verify GitHub repo URL. | Public, accessible, ≥ 3 commits. |

---

## 5. Appendix — Suggested Project Structure

```
src/
├── components/
│   ├── ListItemCard.tsx        # Reusable — used by Home & Detail
│   ├── LoadingView.tsx
│   ├── ErrorView.tsx
│   └── EmptyView.tsx
├── screens/
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   └── DetailScreen.tsx
├── navigation/
│   ├── RootNavigator.tsx       # Conditional auth stack
│   └── AppStack.tsx            # Home → Detail
├── services/
│   ├── api.ts                  # Axios instance
│   └── auth.ts                 # Token gen / storage
├── hooks/
│   ├── useAuth.ts
│   └── useFetch.ts
├── theme/
│   ├── colors.ts
│   └── ThemeProvider.tsx       # Dark mode handling
├── types/
│   └── models.ts
└── App.tsx
```

## 6. Appendix — Suggested Commit Plan (Satisfies C-07)

| # | Commit Message | Scope |
|---|---|---|
| 1 | `chore: bootstrap react-native project, navigation, axios, theme` | Project skeleton, dependencies, navigation shell. |
| 2 | `feat(auth): implement Login screen with validation and JWT storage` | FR-001 through FR-005, NFR-S-001/004. |
| 3 | `feat(home): implement Home with FlatList, pull-to-refresh, and reusable card` | FR-006 through FR-010, NFR-P-002/004. |
| 4 | `feat(detail): implement Detail screen with reusable top component` | FR-011 through FR-013. |
| 5 | `polish: dark mode, empty/error states, ESLint/Prettier` | NFR-U-002/004, NFR-M-001. |

---

**End of Document**
