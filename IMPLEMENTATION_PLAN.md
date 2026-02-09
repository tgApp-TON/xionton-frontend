# Matrix TON - Full Implementation Plan

## Current Priority Order

### ✅ COMPLETED:
- Phase 1: Onboarding flow (4 steps, validation)
- Phase 2: Menu system (fullscreen, stats, referral preview)
- Phase 4: Tables page (Canvas rendering, 12 tables)
- UI improvements (zoom controls, theme toggle, responsive design)

### 🔥 IMMEDIATE PRIORITY (Working Now):
**Phase 3: Backend Integration**
- [ ] Connect Supabase database
- [ ] Setup API routes for user data
- [ ] TON Wallet integration (TON Connect)
- [ ] Real-time data sync
- [ ] Transaction monitoring
- [ ] Payment processing

**Phase 4: Testing & QA**
- [ ] Test full user flow (onboarding → tables → menu → referrals)
- [ ] Mobile responsiveness testing
- [ ] Fix bugs
- [ ] Performance optimization
- [ ] Cross-browser testing

### 📅 BACKLOG (Later):
**Phase 5: Referrals Page**
- [ ] Visual tree structure
- [ ] Referral statistics
- [ ] QR code generation
- [ ] Share functionality

**Phase 6: Statistics Page**
- [ ] Earnings charts (daily/weekly/monthly)
- [ ] Transaction history
- [ ] Export data
- [ ] Analytics dashboard

**Phase 7: Tables Enhancement**
- [ ] Purchase buttons for locked tables
- [ ] Table detail modals
- [ ] Slot filling animations
- [ ] Real-time updates

**Phase 8: Settings Page**
- [ ] User profile editing
- [ ] Wallet management
- [ ] Notification preferences
- [ ] Language selection

---

## Phase 1: Onboarding Flow ✅ DONE
- [x] Registration Screen (4 steps)
- [x] Premium check
- [x] Nickname input
- [x] Country selection
- [x] Referral code validation
- [x] Animated background everywhere

## Phase 2: Main Navigation & Menu (IN PROGRESS)
- [x] Menu button (top right)
- [x] Side menu panel
- [ ] Active page indicator
- [ ] Menu items with icons
- [ ] Smooth transitions

## Phase 3: Dashboard (/dashboard)
- [ ] Welcome header with user nickname
- [ ] Stats cards (4 cards):
  - Total Earned (TON)
  - Active Tables (X/12)
  - Total Referrals
  - Total Cycles
- [ ] Quick actions section
- [ ] Recent activity feed
- [ ] Referral link copy button

## Phase 4: Tables Page (/tables) ✅ DONE
- [x] Canvas table cards (12 tables)
- [x] Neon animations
- [x] Table status (active/locked)
- [x] Position slots (4 per table)
- [x] Cycle counter
- [x] Price display
- [ ] Purchase button for locked tables
- [ ] Click to view table details

## Phase 5: Referrals Page (/referrals)
- [ ] Referral tree visualization
- [ ] Referral stats:
  - Direct referrals count
  - Spillover referrals count
  - Total earnings from referrals
- [ ] Referral link with QR code
- [ ] Share buttons (Telegram, Twitter, Copy)
- [ ] Search/filter referrals
- [ ] Referral list with details

## Phase 6: Statistics Page (/stats)
- [ ] Earnings chart (daily/weekly/monthly)
- [ ] Tables performance breakdown
- [ ] Cycle history timeline
- [ ] Transaction history table
- [ ] Export data (CSV/PDF)
- [ ] Filters by date range

## Phase 7: Profile/Settings Page (/profile)
- [ ] User info display
- [ ] TON wallet address
- [ ] Nickname (with edit option)
- [ ] Country
- [ ] Account age
- [ ] Logout button
- [ ] Language selection
- [ ] Notifications settings

## Phase 8: Table Details Modal
- [ ] Table info (number, price, status)
- [ ] Current cycle number
- [ ] Position slots with usernames
- [ ] Earnings from this table
- [ ] Purchase button (if locked)
- [ ] Spillover indicator
- [ ] History of cycles

## Phase 9: Transactions Page
- [ ] All transactions list
- [ ] Filter by type (purchase, earning, spillover)
- [ ] Transaction details (TX hash, amount, date)
- [ ] Search by TX hash
- [ ] Pending payouts section

## Phase 10: Polish & Animations
- [ ] Loading states for all pages
- [ ] Error handling & messages
- [ ] Success animations
- [ ] Smooth page transitions
- [ ] Mobile responsive design
- [ ] Touch gestures support

## Technical Tasks
- [ ] Connect to real API endpoints
- [ ] Implement TON wallet connection
- [ ] Add transaction signing
- [ ] Setup Telegram WebApp SDK properly
- [ ] Add localStorage for caching
- [ ] Implement refresh tokens
- [ ] Add error boundaries
- [ ] Setup analytics tracking
