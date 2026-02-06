# Community Authentication Implementation

## Overview
Community authentication has been fully integrated into the Sarvadhi frontend app. Both Google authentication and Community Code authentication are now available with feature flags for conditional UI rendering.

## Environment Variables Added

### `.env.local` and `.env.example`
```
# Authentication Features (Toggle UI rendering)
EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=true
EXPO_PUBLIC_ENABLE_COMMUNITY_AUTH=true
```

These flags allow you to toggle authentication methods without code changes.

---

## New Screens Created

### 1. Community Code Screen
**File:** `app/(public)/community-code.tsx`

- **Input:** Community Code (masked input with 12 char limit)
- **Features:**
  - Uppercase auto-formatting
  - Real-time error validation
  - Loading state with spinner
  - Link to signup screen
  - Secure code input styling

- **API Call:** `POST /auth/community/login`
- **Response:** `{ token, user }`

### 2. Community Signup Screen
**File:** `app/(public)/community-signup.tsx`

- **Inputs:**
  - Full Name
  - Email (validated)
  - Community Code
- **Features:**
  - Form validation with error messages
  - Info box with instructions
  - Loading state
  - Back button to previous screen
  - Field-level error display

- **API Call:** `POST /auth/community/signup`
- **Response:** `{ token, user }`

---

## Updated Login Screen

**File:** `app/(public)/login.tsx`

### Key Changes:
- **Conditional Rendering:** Buttons only show if enabled via env flags
- **Two Authentication Methods:**
  1. "Continue with Google" (if `EXPO_PUBLIC_ENABLE_GOOGLE_AUTH=true`)
  2. "Continue with Community Code" (if `EXPO_PUBLIC_ENABLE_COMMUNITY_AUTH=true`)

- **Divider:** Shows "or" between methods if both are enabled
- **Error Handling:** Displays authentication errors
- **Loading States:** Activity indicators during auth process

---

## Updated Auth Service

**File:** `src/services/auth.service.ts`

### New API Methods:
```typescript
// Community authentication
communityCommunityLogin(communityCode: string)
  → POST /auth/community/login
  
communitySignup(name, email, communityCode)
  → POST /auth/community/signup
```

### Existing Methods (Unchanged):
```typescript
googleLogin(idToken: string)
  → POST /auth/google
```

---

## Updated Auth State Management

**File:** `src/store/auth/auth.slice.ts`

### Enhanced AuthState:
```typescript
type AuthState = {
  token: string | null;
  user: User | null;          // NEW
  isAuthenticated: boolean;   // NEW
}

type User = {
  id: string;
  email: string;
  name: string;
}
```

### New Action:
```typescript
setAuth({ token, user })  // Sets both token and user in one dispatch
```

---

## Authentication Flow

```
Login Screen
├── Google Sign-In (if enabled)
│   ├── Call: POST /auth/google { idToken }
│   └── Response: { token, user }
│
└── Community Code Auth (if enabled)
    ├── Community Code Screen
    │   ├── Input community code
    │   └── Call: POST /auth/community/login { communityCode }
    │
    └── OR Community Signup Screen
        ├── Input: name, email, communityCode
        └── Call: POST /auth/community/signup { name, email, communityCode }

After auth (both methods):
├── Dispatch: setAuth({ token, user })
├── Store: JWT token + user data in Redux
└── Navigate: /(protected)/tabs/channels
```

---

## What Remains Unchanged

✅ **No Breaking Changes:**
- Channel membership logic
- Message handling
- WebSocket/Socket.IO configuration
- Google Cloud Storage integration
- Push notifications
- Channels display and functionality
- Messages display and functionality
- Environment setup process
- Deployment process

✅ **Socket.IO still works:**
- Uses `Authorization: Bearer <JWT>` header
- Works for both authentication methods
- Same JWT handling as before

---

## Styling & UX Copy

### Login Screen Messages:
- "Internal community access only" - Hint text on login

### Community Code Screen:
- "Join Sarvadhi"
- "Enter the Sarvadhi community code to join"
- "Internal community access only"

### Community Signup Screen:
- "Create Account"
- "Join the Sarvadhi community"
- "📝 Fill in your details and enter your community code to join"

---

## Testing Checklist

- [ ] Google Auth enabled → Shows "Continue with Google" button
- [ ] Community Auth enabled → Shows "Continue with Community Code" button
- [ ] Both enabled → Shows divider with "or" text
- [ ] Disable Google in .env → Button hidden
- [ ] Disable Community in .env → Button hidden
- [ ] Community Code validation → Error on empty input
- [ ] Community Code login flow → Navigates to channels
- [ ] Community Signup flow → Creates account and navigates
- [ ] Logout → Clears token and user from Redux
- [ ] Socket.IO → Connects with JWT from both auth methods

---

## File Summary

**Files Created:**
- `app/(public)/community-code.tsx`
- `app/(public)/community-signup.tsx`
- `.env.example` (updated)

**Files Updated:**
- `app/(public)/login.tsx`
- `src/services/auth.service.ts`
- `src/store/auth/auth.slice.ts`
- `.env.local` (updated)

**Files Unchanged:**
- All other app screens
- Socket.IO configuration
- API client setup
- Redux store (except auth slice)
