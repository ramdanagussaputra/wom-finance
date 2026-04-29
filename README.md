# WOM Frontend Engineer Technical Test

A React Native mobile application built for the WOM Frontend Engineer technical assessment. This app demonstrates modern React Native architecture, secure client-side authentication mocking, remote API integration, and responsive UX design.

## Features

- **Authentication Mocking:** Secure login flow with client-side validation and local JWT token generation.
- **Persistent Sessions:** Auth tokens are persisted securely using AsyncStorage, surviving app restarts.
- **Remote Data Fetching:** Integrates with the [DummyJSON API](https://dummyjson.com/) to fetch and display a catalog of products.
- **Dynamic Layout:** Features a performant `FlatList` with pull-to-refresh, category filtering, and local search.
- **State Management:** Distinct UI states for Loading, Error, and Empty data scenarios.
- **Theming:** Full support for system-level Dark Mode and Light Mode with a customized color palette.
- **Accessibility & UX:** Includes skeleton loaders, haptic-like error animations, and smooth screen transitions.

## How to Login

The app uses a mocked authentication flow. There is no real backend database verifying credentials. 

To log in, simply use **any valid email format** and a **password of at least 6 characters**.

**Example Credentials:**
- **Email:** `test@example.com`
- **Password:** `123456`

*Note: Entering an invalid email format or a short password will trigger inline validation errors.*

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [Yarn](https://yarnpkg.com/) or npm
- iOS Simulator (requires macOS and Xcode) or Android Emulator (requires Android Studio)

## Getting Started

### 1. Install Dependencies

Clone the repository and install the required packages:

```bash
npm install
# or
yarn install
```

### 2. Install CocoaPods (iOS only)

If you are running on iOS, you must install the native dependencies:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

### 3. Run the App

Start the Metro bundler and run the application on your preferred platform.

**For Android:**
```bash
npm run android
# or
yarn android
```

**For iOS:**
```bash
npm run ios
# or
yarn ios
```

## Project Structure

- `src/components/` - Reusable UI elements (Buttons, Cards, Error Views, Skeletons)
- `src/screens/` - Main views (Login, Home, Detail)
- `src/navigation/` - React Navigation stack setup (Auth-aware routing)
- `src/services/` - API configuration (Axios) and authentication mocking
- `src/theme/` - Color palettes and styling tokens
- `src/types/` - TypeScript interfaces and models

## Assessment Requirements Satisfied

This application satisfies all Functional and Non-Functional requirements outlined in the `SRS_WOM_Mobile_App.md` specification document, including performance, code modularity, UX standards, and comprehensive error handling.
