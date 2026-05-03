# Fix: Chat Box Messages Overlapping — One Estela Place

> **AI Agent Instructions:** Read this file top-to-bottom and execute every step in order.
> Do not skip steps. Confirm each file edit before proceeding to the next.

---

## Context

The chat widget at `oneestela.vercel.app` shows message bubbles overlapping each other.
Root cause: the message list container and individual message rows are missing proper
`flex-col`, `gap`, and `min-h-0` constraints, and avatar icons are absolutely or
incorrectly positioned relative to bubble wrappers.

---

## Step 1 — Locate the chat component file

Search the project for the main chat widget component. It is likely one of:

```
components/ChatWidget.tsx
components/chat-widget.tsx
components/ChatBot.tsx
components/chat/ChatWidget.tsx
components/ui/chat-widget.tsx
```

Run in terminal:
```bash
find . -type f -name "*.tsx" | xargs grep -l "ChatWidget\|chat-widget\|ChatBot\|chatbot" 2>/dev/null
```

Open the file that renders the message list and individual message bubbles.

---

## Step 2 — Fix the messages scroll container

Find the `div` that wraps all chat messages (the scrollable area).
It will contain a `.map()` over messages or similar.

**Look for** a pattern like:
```tsx
<div className="...">
  {messages.map((msg) => ( ... ))}
</div>
```

**Replace** its `className` so it includes these Tailwind classes:
```
flex flex-col gap-3 overflow-y-auto min-h-0 h-full p-3
```

Full corrected example:
```tsx
<div className="flex flex-col gap-3 overflow-y-auto min-h-0 h-full p-3">
  {messages.map((msg) => ( ... ))}
</div>
```

> **Why:** Without `flex flex-col`, children stack using default block layout and can
> overlap. `min-h-0` prevents the flex child from overflowing its parent.
> `gap-3` adds consistent spacing between every bubble.

---

## Step 3 — Fix individual message row wrapper

Each message row (the wrapper around avatar + bubble) needs to be a flex row
that does **not** overlap the next row.

**Look for** the per-message wrapper div (inside the `.map()`). It might look like:
```tsx
<div className="flex items-end ...">
```

Ensure it has:
```
flex items-end gap-2 w-full
```

For **bot messages** (left-aligned):
```tsx
<div className="flex items-end gap-2 w-full justify-start">
```

For **user messages** (right-aligned):
```tsx
<div className="flex items-end gap-2 w-full justify-end flex-row-reverse">
```

---

## Step 4 — Fix the bubble itself

Each bubble `div` must **not** use `position: absolute` or `position: relative`
unless intentionally needed. Ensure the bubble uses:

```tsx
<div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm break-words">
  {message.content}
</div>
```

Key classes to verify are present:
- `max-w-[75%]` — prevents bubbles from spanning full width and colliding
- `break-words` — prevents long text from overflowing and overlapping
- `rounded-2xl` — visual polish

---

## Step 5 — Fix the avatar icon

The avatar (bot emoji or user icon) must be a **fixed-size sibling**, not overlapping the bubble.

```tsx
<div className="w-8 h-8 flex-shrink-0 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">
  🤖
</div>
```

Key: `flex-shrink-0` prevents the avatar from squishing and causing layout shifts.

---

## Step 6 — Fix the outer chat widget container

The overall chat popup container must use `flex flex-col` so the header, messages,
and input area stack properly without overlap.

Find the top-level chat widget `div` (the one that sets the popup dimensions).

Ensure it looks like:
```tsx
<div className="flex flex-col w-[340px] h-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden">
  {/* Header */}
  <div className="flex-shrink-0 ...">...</div>

  {/* Tab bar */}
  <div className="flex-shrink-0 ...">...</div>

  {/* Messages area — THIS must be flex-1 min-h-0 */}
  <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 p-3">
    {messages.map(...)}
  </div>

  {/* Input area */}
  <div className="flex-shrink-0 ...">...</div>
</div>
```

> **Critical:** The messages container must be `flex-1 min-h-0`. Without `min-h-0`,
> a flex child ignores overflow and bleeds into sibling sections causing visual overlap.

---

## Step 7 — Handle markdown/bold text in bot messages

The bot messages contain `**bold**` markdown syntax rendered as raw text.
Add a simple renderer so `**text**` becomes `<strong>text</strong>`:

```tsx
function renderBotMessage(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
```

Use it in the bubble:
```tsx
<div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm break-words bg-green-600 text-white">
  {renderBotMessage(message.content)}
</div>
```

---

## Step 8 — Verify and save

After making all edits:

1. Run the dev server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000` and click the chat widget.

3. Confirm:
   - [ ] Messages no longer overlap
   - [ ] Bot messages appear on the left with green bubbles
   - [ ] User messages appear on the right with blue bubbles
   - [ ] Scrolling works when messages exceed container height
   - [ ] Avatar icons sit beside bubbles without colliding

4. If overlapping persists, check for any `position: absolute` or negative `margin`
   on message elements in both the TSX and any associated CSS/styles files:
   ```bash
   grep -n "absolute\|z-index\|-mt-\|-mb-" components/ChatWidget.tsx
   ```
   Remove or correct any conflicting positioning.

---

## Summary of Required CSS Classes

| Element | Required Classes |
|---|---|
| Chat popup wrapper | `flex flex-col overflow-hidden` |
| Messages container | `flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 p-3` |
| Message row (bot) | `flex items-end gap-2 w-full justify-start` |
| Message row (user) | `flex items-end gap-2 w-full justify-end flex-row-reverse` |
| Bubble | `max-w-[75%] rounded-2xl px-4 py-2 text-sm break-words` |
| Avatar | `w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center` |

---

*Generated for: One Estela Place — `github.com/EurusAres/oneestela`*
