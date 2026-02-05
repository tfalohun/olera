# Scratchpad

> A living document for tracking work in progress, decisions, and context between sessions.

---

## Current Focus

_What's the main thing being worked on right now?_

- **Caregiver Experience Completion**: Building out the remaining navbar sections
  - ✅ Homepage - Complete
  - ✅ Find Care / Browse - Complete
  - ✅ Community Forum - Complete
  - ❌ Resources - Not built (18 pages needed)
  - ❌ Benefits Center - Not built

---

## Caregiver Experience Status

### ✅ Homepage (`/`)

| Section | Status |
|---------|--------|
| Hero with search bar | ✅ Complete |
| Browse by Care Type (6 categories) | ✅ Complete |
| Featured Video Section | ✅ Complete |
| Social Proof (animated counters) | ✅ Complete |
| Scrolling Tags | ✅ Complete |
| Community Cards (3 recent posts) | ✅ Complete |

### ✅ Main Navbar

**Final Structure (as of 2026-02-05):**
```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]    Find Care · Community · Resources · Benefits Center   │  For Providers · Login  │
└──────────────────────────────────────────────────────────────────┘
```

- Find Care: Mega-menu with 6 care types + resource links
- Community: Links to `/community`
- Resources: Links to `/resources` (⚠️ 404 - not built)
- Benefits Center: Links to `/benefits` (⚠️ 404 - not built)

### ✅ Find Care / Browse (`/browse`)

| Feature | Status |
|---------|--------|
| Location search (18K+ cities/ZIP) | ✅ Complete |
| Care type filter (6 types) | ✅ Complete |
| Payment type filter | ✅ Complete |
| Star rating filter | ✅ Complete |
| Sort options | ✅ Complete |
| View modes (Carousel, Grid, Map) | ✅ Complete |
| Provider cards | ✅ Complete |
| Supabase integration | ✅ Complete |

### ✅ Community Forum (`/community`)

| Feature | Status |
|---------|--------|
| Post list with cards | ✅ Complete |
| Category tabs (6 types + All) | ✅ Complete |
| Search discussions | ✅ Complete |
| Post composer with validation | ✅ Complete |
| Post detail modal | ✅ Complete |
| Comments with threading | ✅ Complete |
| Report functionality (posts + comments) | ✅ Complete |
| URL state (?category, ?post) | ✅ Complete |
| Responsive layout | ✅ Complete |
| Footer hidden on community pages | ✅ Complete |

**⚠️ Backend not connected:**
- Post submission → console.log only
- Comment submission → not wired
- No database persistence

### ❌ Resources (`/resources`)

**Status: NOT BUILT**

Navigation links exist in mega-menu but pages 404. Needs 18 pages:

| Care Type | Pages Needed |
|-----------|-------------|
| Home Health | Guide, Paying For, vs Home Care |
| Home Care | Guide, Paying For, vs Home Health |
| Assisted Living | Guide, Paying For, vs Nursing Home |
| Memory Care | Guide, Paying For, Signs It's Time |
| Nursing Homes | Guide, Paying For, Medicare/Medicaid |
| Independent Living | Guide, Costs, Is It Right? |

### ❌ Benefits Center (`/benefits`)

**Status: NOT BUILT**

Navigation link exists but page 404s. Should contain:
- Medicare information
- Medicaid information
- VA Benefits
- Long-term care insurance
- Financial assistance programs

---

## In Progress

_Active work items and their current state._

- [x] Initial project setup
- [x] Provider cards on homepage
- [x] Provider detail page
- [x] Hero section redesign
- [x] Provider card spacing standardization
- [x] Browse page with filtering
- [x] iOS Supabase integration (Phase 1)
- [x] Community Forum - V2 design complete
- [x] Landing page community cards (real forum data)
- [x] Navbar finalization (removed Get Started button)
- [ ] Resources section (18 pages)
- [ ] Benefits Center page

---

## Blocked / Needs Input

_Items waiting on decisions, external input, or dependencies._

- **Resources content**: Need content/copy for 18 resource articles
- **Benefits Center design**: Need design direction (single page vs multi-page)

---

## Next Up

_What should be tackled next, in priority order._

1. **Benefits Center** (`/benefits`) - Single page for government/insurance benefits
2. **Resources Hub** (`/resources`) - Landing page + 18 individual articles
3. Forum backend integration (post/comment submission)
4. User authentication (login/signup)

---

## Decisions Made

_Key decisions with rationale, for future reference._

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-05 | Navbar: Remove "Get Started" button | Routes to 404, not needed |
| 2026-02-05 | Navbar: "Benefits" → "Benefits Center" | Clearer labeling |
| 2026-02-05 | Forum posts sorted by createdAt DESC | Mirrors Supabase query pattern |
| 2026-02-05 | Forum report modal on comments | Same UX as conversation cards |
| 2026-02-05 | No adapter layer for iOS schema | User feedback: keep both uniform, simpler code |
| 2026-02-05 | Server-side browse page over client-side | Real Supabase data requires server components |
| 2026-01-30 | Added Claude Code slash commands | Standardize workflow for explore → plan → build → save cycle |

---

## Key Files Reference

### Caregiver Experience

| Area | Key Files |
|------|-----------|
| Homepage | `app/page.tsx` |
| Navbar | `components/shared/Navbar.tsx`, `components/shared/NavMenuData.ts` |
| Find Care Mega-menu | `components/shared/FindCareMegaMenu.tsx` |
| Browse | `components/browse/BrowseClient.tsx` |
| Community Forum | `app/community/page.tsx` |
| Forum Components | `components/community/ForumPostCardV3.tsx`, `ForumCommentV2.tsx`, `PostModal.tsx` |
| Forum Data | `data/mock/forumPosts.ts`, `data/mock/forumComments.ts` |
| Forum Types | `types/forum.ts` |

### Data & Types

| Purpose | File |
|---------|------|
| Provider types | `lib/types/provider.ts` |
| Forum types | `types/forum.ts` |
| Mock providers | `lib/mock-providers.ts` |
| Mock forum posts | `data/mock/forumPosts.ts` |
| Mock forum comments | `data/mock/forumComments.ts` |

---

## Notes & Observations

_Useful context, patterns noticed, things to remember._

- Project is a TypeScript/Next.js web app for senior care discovery
- 6 care types: Home Health, Home Care, Assisted Living, Memory Care, Nursing Homes, Independent Living
- Community forum uses modal-based post viewing (Medium-style)
- Footer is hidden on community pages via layout.tsx
- Supabase has 39,355+ real providers in `olera-providers` table

---

## Session Log

### 2026-02-05

**Session 5 - Caregiver Experience Overview:**
- Created comprehensive overview of all caregiver-facing features
- Documented status of Homepage, Navbar, Find Care, Community, Resources, Benefits Center
- Identified gaps: Resources (18 pages) and Benefits Center not built

**Session 4 - Navbar Finalization:**
- Removed "Get Started" button from navbar (linked to 404)
- Changed "Benefits" to "Benefits Center" in nav
- Changed "Log In" to "Login" for consistency
- Final navbar: Logo | Find Care · Community · Resources · Benefits Center | For Providers · Login

**Session 3 - Community Forum Completion:**
- Added report modal to ForumCommentV2 (same as ForumPostCardV3)
- Updated landing page community cards to use real forum data
- Changed query to sort by createdAt DESC (most recent posts)
- Fixed landing page card links to `/community?post=<slug>`

**Session 2 - Community Forum V2:**
- Built full community forum with modal-based post viewing
- Added post composer with inline validation
- Added category filtering and search
- Added report functionality
- Implemented responsive 3-column desktop / single-column mobile layout

**Session 1 - Supabase Unification:**
- Connected all pages to iOS Supabase
- Homepage, Browse, Provider Detail all use real data
- Phase 1 complete, Phase 2/3 waiting for iOS approval

### 2026-02-03

**Hero Section Redesign:**
- Added HousingAnywhere-inspired pill-style search bar
- Added social proof pill above headline
- Added background image with overlay

**Provider Card Spacing Fixes:**
- Standardized card height to 512px (256px image + 256px content)
- Fixed tooltip z-index issues

### 2026-02-02

- Added "Top providers near you" section
- Created ProviderCard component
- Created provider detail page

### 2026-01-30

- Set up Claude GitHub App
- Created slash commands
- Created SCRATCHPAD.md

---

_Older sessions archived to `archive/SCRATCHPAD-[YYYY-MM].md`_
