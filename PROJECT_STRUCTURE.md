# Matrix TON - Project Structure & Flow

## Screen Flow & Navigation

### 1. Entry Point (/)
- **File**: `app/page.tsx`
- **Purpose**: Redirects to `/dashboard`
- **Trigger**: Opening the app

### 2. Registration Flow
- **File**: `components/layout/RegistrationScreen.tsx`
- **Trigger**: First time user OR not registered
- **Steps**:
  1. **Check Step**: Verify Telegram Premium (required), account age (12+ months), channel subscription
  2. **Nickname Step**: Enter unique nickname (3-20 chars, alphanumeric + underscore)
  3. **Country Step**: Select country from list
  4. **Referral Step**: Optional referral code entry (auto-filled if came via referral link)
- **On Complete**: User registered → redirect to Dashboard

### 3. Dashboard (/dashboard)
- **File**: `app/dashboard/page.tsx`
- **Purpose**: Main overview with stats
- **Shows**: Total earned, active tables, referrals, cycles
- **Navigation**: Tabs for overview, transactions, payouts

### 4. Tables (/tables)
- **File**: `app/tables/page.tsx`
- **Component**: `components/tables/CanvasTableCard.tsx`
- **Purpose**: Display all 12 tables with Canvas animations
- **Shows**: Table status (active/locked), positions filled, cycles, price
- **Features**: Neon animations, 3-layer platforms, pulsing borders

### 5. Referrals (/referrals)
- **Status**: Not yet implemented (404)
- **Planned**: Referral tree, stats, link sharing

### 6. Stats (/stats)
- **Status**: Not yet implemented (404)
- **Planned**: Detailed statistics, charts, history

## Global Components

### Layout
- **File**: `app/layout.tsx`
- **Background**: `.stars-bg` class - gradient with animated purple orbs
- **Provider**: `TelegramProvider` wraps all pages

### Menu Button
- **File**: `components/ScrollButtons.tsx`
- **Position**: Top right corner
- **Features**: 3-line hamburger menu, opens side panel with navigation

### Background
- **File**: `app/globals.css`
- **Class**: `.stars-bg`
- **Style**: Gradient `#1a1a2e → #16213e → #0f3460` with pulsing purple orbs

## Data Flow

1. **User arrives** → Check registration status
2. **Not registered** → Show `RegistrationScreen` (4 steps)
3. **Registered** → Redirect to `/dashboard`
4. **Navigation** → Menu button (top right) opens side panel
5. **Tables page** → Canvas cards render with animations
6. **API calls** → `/api/referral/validate` for referral codes

## Key Files

- `app/layout.tsx` - Root layout with background
- `app/globals.css` - Global styles & animations
- `components/layout/RegistrationScreen.tsx` - 4-step registration
- `components/tables/CanvasTableCard.tsx` - Canvas table rendering
- `components/ScrollButtons.tsx` - Menu button & side panel
- `lib/types.ts` - TypeScript types & constants

## Testing & Development

### Reset Registration (View Onboarding Again)
To test the onboarding flow again:
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh page (Cmd + R)
4. Onboarding will appear again

### Quick Commands
- Clear registration: `localStorage.removeItem('matrix_ton_registered')`
- Check status: `localStorage.getItem('matrix_ton_registered')`
- Set registered: `localStorage.setItem('matrix_ton_registered', 'true')`
