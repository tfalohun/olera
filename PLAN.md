# Connection Drawer — Unified Architecture Plan

## 1. Audit: Current State Inconsistencies

### What the Screenshots Show (live / pre-deploy)

**Screenshot 1 — Family view (accepted, outbound):**
- 2-column layout: conversation left (scrollable), sidebar right (Contact + Request Status)
- Old system note: green pill "✓ Provider Six responded"
- Old acceptance copy: "Provider Six has accepted your connection request. You can now get in touch directly."
- Placeholder: "Reply to provider..."
- Sidebar shows "Contact information not yet available" (provider has no phone/email on profile)
- Sidebar shows Request Status card (call requested, amber, with cancel)
- "End connection" link at bottom of sidebar

**Screenshot 2 — Provider view (accepted, inbound):**
- 1-column layout: narrower panel, no sidebar
- Old system note: green pill "✓ Caregiver Five responded"
- Old acceptance copy: "You accepted this connection. Reach out to start the conversation."
- Placeholder: "Reply to provider..." (BUG — should say "Reply to family...")
- "View provider profile" link (BUG — should say "View family profile")
- No contact info shown anywhere
- No request status shown (even though a call was requested)
- No next-step CTA, no end-connection link

### Current Code State (branch, post Phase A/B)

My Phase A/B changes addressed several of these issues but introduced new complexity. Here's what the code does NOW:

| Element | Family View | Provider View | Consistent? |
|---------|-------------|---------------|------------|
| Layout | Single-column 480px | Single-column 480px | ✅ Yes (fixed in Phase B) |
| Status header | Shown (renderStatusHeader) | Shown (same) | ✅ Yes |
| Status pill | Context-aware (Connected/Awaiting) | Context-aware (same) | ✅ Yes |
| Profile link | "View provider profile" | "View provider profile" | ❌ BUG — says "provider" for family profiles too |
| Contact chips | Shown if accepted + has data | Shown if accepted + has data | ✅ Yes |
| Schedule CTA | "Schedule a Call" button | "Schedule a Call" button | ⚠️ Technically shown to both roles, but semantics differ |
| Request status | Requester view (amber status) | Responder view (action card) | ✅ Differentiated correctly |
| System banner | Role-aware copy | Role-aware copy | ✅ Yes |
| Acceptance bubble | Emerald, family-oriented | Emerald, provider-oriented | ✅ Different copy, same styling |
| Request bubble header | "Your request" | "Request from [Name]" | ✅ Correctly differentiated |
| Message placeholder | "Message [Name]..." | "Message [Name]..." | ✅ Yes |
| End connection | Shown for accepted | Shown for accepted | ✅ Yes |
| Past actions | Browse/Reconnect/Remove | Remove from list | ✅ Correctly role-specific |

### Remaining Problems

**1. Redundant information layers**
The drawer now has THREE places that communicate status:
- Status pill (top-right of header)
- Status header card (below divider, with icon + heading + copy)
- System banner (inside conversation thread)

This is overengineered. The user sees "Connected" three times in three different formats.

**2. Too many sections between header and conversation**
For an accepted connection, the user has to scroll past:
1. Profile header (avatar, name, location, status pill, profile link)
2. Accept/Decline buttons (pending only)
3. Divider
4. Status header card (icon + heading + support text)
5. Contact chips (phone/email/website)
6. Schedule a Call CTA + secondary options
7. OR Request status card

...before they even see the conversation. That's 5-6 visual blocks above the actual thread.

**3. "Schedule a Call" CTA shown to providers**
When a family requests a call, the provider should see the response card. But when NO request exists, the provider also sees "Schedule a Call" — which doesn't make sense. Providers don't schedule calls with families; they respond to scheduling requests from families.

**4. Profile link bug**
`View {otherProfile.type === "family" ? "family" : "provider"} profile` — this is correct in code but the screenshot shows "View provider profile" on both sides. Need to verify the `otherProfile.type` value for family profiles (it might be stored as something other than "family").

**5. Connection request bubble is the first thing in the conversation but its context is better served structurally**
The request bubble ("Hi, I'm looking for personal care for loved one needed ASAP") contains the most important context — what the family needs. But it scrolls away as the conversation grows. The structured data (care type, urgency, recipient) should be persistent and visible.

**6. Acceptance bubble + system banner are redundant**
After acceptance, the thread shows:
- System banner: "Connected · You can now message Provider directly"
- Acceptance bubble: "Great news — Provider accepted your request..."
These say the same thing in two different formats, back-to-back.

---

## 2. Core Goal

The drawer optimizes for ONE outcome: **both parties assess fit and schedule an initial call or meeting.**

The funnel:
```
Request sent → Provider reviews → Acceptance → Conversation → Schedule call → Care begins
```

Each state of the drawer should make exactly ONE thing obvious:
- **Pending (outbound)**: "You sent a request. They'll respond soon."
- **Pending (inbound)**: "Someone needs care. Review and respond."
- **Accepted**: "You're connected. Exchange messages. Schedule a call when ready."
- **Past**: "This is over. Here's what you can do next."

The drawer is NOT:
- A full-featured chat app (no read receipts, no typing indicators, no file upload)
- A booking system (no calendar widget, no payment)
- A CRM dashboard (no analytics, no tags, no notes)

It IS:
- A focused connection panel where two parties exchange enough context to decide if they should talk on the phone or meet in person.

---

## 3. Proposed Unified Structure

### Layout: Always single-column, 480px max-width

```
┌─────────────────────────────────────────┐
│  [←]  Provider Six           Connected  │  HEADER
│        Home Care · Washington, DC       │
│        View profile                     │
├─────────────────────────────────────────┤
│  ┌─ Care request ──────────────────┐    │  CONTEXT CARD
│  │ Memory Care · For Mother · ASAP │    │  (persistent, not a bubble)
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│                                         │
│  [conversation thread]                  │  CONVERSATION
│  message bubbles, date separators       │  (scrollable)
│                                         │
├─────────────────────────────────────────┤
│  📞 Schedule a Call    |  More ▾        │  ACTION BAR
│  ─── or ──────────────────────────────  │  (fixed at bottom,
│  [message input]              [Send]    │   above input)
├─────────────────────────────────────────┤
│  End connection                         │  FOOTER
└─────────────────────────────────────────┘
```

### Detailed Section Spec

#### HEADER (fixed, shrink-0)

Compact. Shows who + status. No status header card — the status pill IS the status.

```
Avatar  Category · Location        [Status Pill]
Name
View [family|provider] profile
[Accept] [Decline]  ← only for pending inbound
```

Remove:
- The large status header card with icon/heading/support text (redundant with pill)
- The divider line below header (unnecessary visual weight)

The status pill already communicates state. The support text ("Most providers respond within a few hours") can move to a single-line banner inside the conversation, not a separate card.

#### CONTEXT CARD (fixed, shrink-0, below header)

Shows the structured request data. Compact horizontal layout:

```
┌──────────────────────────────────────┐
│  Memory Care · For Mother · ASAP     │
│  Sent Feb 13                         │
└──────────────────────────────────────┘
```

- Gray background, small text, always visible
- Replaces the chat bubble for structured data (the natural-language summary in the request bubble is removed — it was always a reconstruction of the structured data anyway)
- If no structured data available, this section is hidden

Why: This is the Rover pattern adapted minimally. The family's care needs are the MOST important context for the provider. Keeping them pinned ensures the provider doesn't have to scroll up to remember what the family needs.

#### CONVERSATION (scrollable, flex-1)

The thread. Clean bubbles. Date separators between days.

Messages in the thread:
- Regular messages (dark = own, light = other)
- Next-step request cards (structured card style)
- System notes (centered pills for events like "call requested cancelled")
- Acceptance marker: single centered line "Connected · Feb 13" (NOT a bubble, NOT a card — just a timestamp like date separators)

Remove:
- The large emerald acceptance bubble (redundant — the status pill and connected marker are enough)
- The SystemBanner component in the conversation (moves to a single-line hint below the context card for pending states only)
- The "No messages yet" empty state (the conversation is never empty — the acceptance marker is always there)

#### ACTION BAR (fixed, shrink-0, between conversation and input)

**Accepted state (no active request):**
```
[📞 Schedule a Call]  [More options ▾]
```

- Primary CTA: "Schedule a Call" (full-width button, primary color)
- "More options": dropdown/popover with "Request a consultation" + "Request a home visit" (if applicable)
- Only shown to families (providers don't initiate scheduling — they respond)

**Accepted state (active request — requester view):**
```
┌ Call requested · 2h ago ─────── [Cancel] ┐
│ Waiting for Provider to suggest times     │
└───────────────────────────────────────────┘
```

- Compact inline status, no separate section header
- Cancel link is inline, not a separate red button

**Accepted state (active request — responder view):**
```
┌ Caregiver wants to schedule a call ──────┐
│ [Suggest times]           [Decline]       │
└───────────────────────────────────────────┘
```

- Action-oriented: two buttons, clear what to do
- "Suggest times" pre-fills message input

**Pending state:**
- No action bar (just the message input below)

**Past state:**
- No action bar, no message input

#### MESSAGE INPUT (fixed, shrink-0)

```
[Message Provider Six...]              [Send]
```

- Only shown for pending + accepted states (not blurred)
- Placeholder: "Message [Name]..."
- Simple text input + send button

#### FOOTER (fixed, shrink-0, conditional)

- Accepted: "End connection" (small, gray, understated)
- Pending outbound (family): "Withdraw request"
- Past (either role): "Remove from list" or "Browse similar" / "Reconnect"

### What Gets Removed

| Removed Element | Why |
|-----------------|-----|
| Status header card (renderStatusHeader) | Redundant with status pill. Over-communicates state. |
| SystemBanner in conversation thread | Redundant with context card + status pill. Keep only a subtle hint line for pending states. |
| Emerald acceptance bubble | Redundant. "Connected" pill + "Connected · Feb 13" marker is enough. |
| "CONVERSATION" section label | The conversation IS the panel. No label needed. |
| Contact chips between header and conversation | Move contact info to the profile header inline (phone link, email link). Or show after acceptance in the header area. |
| "No messages yet" empty state | Acceptance marker ensures thread is never visually empty. |
| Old TWO-COLUMN comment block | Dead code left from Phase A/B. |
| Large status icon SVGs (PaperAirplane, Bell, Check, Minus) | No longer needed if we remove the status header card. |

### What Gets Simplified

| Element | Before | After |
|---------|--------|-------|
| Status communication | 3 places (pill, header card, banner) | 1 place (pill) + 1 hint line for pending |
| Acceptance marking | Emerald bubble + banner | Single centered "Connected · Feb 13" line |
| Contact info | Separate chip section | Inline in header (phone icon link, email icon link) |
| Next-step CTA | Above conversation, separate section | Fixed action bar between conversation and input |
| Request status | Separate section above conversation | Inline in action bar |

### Role-Specific Differences (the ONLY differences)

| Element | Family | Provider |
|---------|--------|---------|
| Profile link | "View provider profile" | "View family profile" |
| Request bubble | "Your request" (right-aligned, dark) | "Request from [Name]" (left-aligned, light) |
| Action bar CTA | "Schedule a Call" + more options | NOT shown (providers respond, don't initiate) |
| Action bar responder | Requester status card | "Suggest times" + "Decline" |
| Pending actions | "Withdraw request" | "Accept" / "Decline" |
| Past actions | "Browse similar" / "Reconnect" / "Remove" | "Remove from list" |
| Pending hint | "Request sent · Most providers respond within a few hours" | "[Family] is looking for [care type]" |

Everything else is identical.

---

## 4. Why This Improves Conversion

**Less cognitive load**: The drawer currently shows 5-6 blocks before the conversation. Users have to parse status three different ways. The new design: header (who + status), context card (what they need), then straight to conversation.

**Clear next action**: The fixed action bar means "Schedule a Call" is always visible without scrolling. It's not buried in the conversation or behind a sidebar.

**Conversation-first**: The thread is the primary area. Context is pinned at top, actions pinned at bottom. The conversation fills the middle — which is where fit assessment happens.

**Provider clarity**: Providers currently get the same "Schedule a Call" CTA as families, which is confusing. In the new design, providers only see response actions when a family has requested something. Otherwise they just see the conversation and message input.

**Reduced feature layers**: By removing redundant status communication (3→1), redundant acceptance messaging (bubble+banner→marker), and pulling the action bar out of the scroll area, the entire experience feels cleaner and more intentional.

---

## 5. Implementation Plan

### Files Changed
- `components/portal/ConnectionDrawer.tsx` — full rewrite of the layout section

### No Backend Changes
- No API changes
- No schema changes
- No new dependencies

### Steps

1. **Remove status header card** (renderStatusHeader, the 4 SVG icon components)
2. **Add context card** — compact horizontal display of care type + recipient + urgency + date, shown between header and conversation
3. **Remove SystemBanner from conversation** — replace with a single-line pending hint below context card (only for pending states)
4. **Replace acceptance bubble** with centered "Connected · [date]" marker
5. **Move contact info** into the header section (inline phone/email links after "View profile")
6. **Create action bar** — fixed section between conversation and message input:
   - Family: Schedule a Call CTA (or request status if active)
   - Provider: Response card if request exists, otherwise nothing
7. **Remove dead code** — old TWO-COLUMN comments, unused render functions
8. **Fix profile link** — correctly show "family" vs "provider" based on otherProfile.type

### What Stays Untouched
- All API calls (fetch, polling, message, next-step, withdraw, hide, end)
- All state management (useState hooks, handlers)
- ConfirmDialog component
- Next step confirmation modal
- connection-utils.ts changes (tab rename, status config)
- connections/page.tsx changes (tab rename, empty states)
