---
name: Add content flow v2
overview: "Refactor the add-link flow: progress bar in modal while saving; on success close modal and show refreshed Library Saved list; show a small progress bar and \"Processing with AI\" label on content cards while AI runs; plus UX improvement suggestions."
todos: []
isProject: false
status: implemented
---

# Add content flow v2

## Goals

1. **Progress bar while saving** – Show an indeterminate progress bar inside the add-content modal during `POST /api/content`.
2. **On save show the save list** – After successful save, close the modal and show the refreshed Library Saved list (new item visible).
3. **While AI is processing** – On each content card, show a small progress bar and "Processing with AI" label when that item is being processed (triggered in background after save).
4. **Suggestions** – How to improve the flow and UX further.

---

## 1. Progress bar while saving (in modal)

- **Where:** [ui/src/pages/library.js](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\pages\library.js) – add-content modal.
- **Flow:** On "Save Content" click, replace modal body with:
  - Indeterminate progress bar (reuse pattern from [ui/src/styles/animations.css](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\styles\animations.css) `.global-loading-bar-inner` / `loadingBarSlide`).
  - Short label: e.g. "Saving link…".
- No global `showProgress`/`hideProgress` for this flow; progress stays inside the modal.

---

## 2. On save show the save list

- **After successful** `POST /api/content`:
  - Close the modal (no success step inside the modal with Done/View).
  - Refresh the Library Saved list so the new item appears (see below).
  - Trigger `POST /api/ai/process-content` in the background (no await); add the returned `content_id` to a client-side "processing" set so the card shows "Processing with AI" (see section 3).
- **Refresh implementation:** When add-content modal closes after a successful save and the current route is Library with Saved tab, call a function that:
  - Fetches `GET /api/content` (same params as [ui/src/pages/library.js](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\pages\library.js) `renderLibrarySaved`).
  - Replaces `#content-list` innerHTML with the new items via `contentCardHtml(item, { showAiStatus: true })`, passing the current "processing" set so cards can show the processing state (see section 3).
- If the user is not on Library Saved, no refresh (e.g. share flow from another page); optional: still close modal and navigate to `#library` then refresh.

---

## 3. Small progress bar + "Processing with AI" in content card

- **Backend:** Only `ai_processed: bool` exists ([backend/app/schemas/models.py](c:\Users\rites\OneDrive\Documents\code\zunoapp\backend\app\schemas\models.py)); no `ai_status: 'processing'`. So "processing" is inferred on the client.
- **Client-side "processing" set:**
  - In [ui/src/core/state.js](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\core\state.js) (or library.js if preferred), maintain a `Set` of content IDs for which we have triggered `POST /api/ai/process-content` and not yet seen `ai_processed: true` (e.g. `processingContentIds`).
  - When we call `POST /api/ai/process-content` (e.g. after save), add the `content_id` to this set.
  - When we fetch the content list (or content detail) and an item has `ai_processed: true`, remove its id from the set.
  - Optional: poll the list every 10–15s while the set is non-empty so cards update when AI finishes, or clear from set after a timeout (e.g. 2 minutes) to avoid stale state.
- **Content card UI:** In [ui/src/components/ui.js](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\components\ui.js) `contentCardHtml`:
  - When `showAiStatus` is true, support a third state: **processing** (id is in the processing set).
  - **Processing state:** Render a small indeterminate progress bar (e.g. thin bar with same animation as global loading bar) + label "Processing with AI" (and optionally a small spinner icon) instead of "Pending" or "AI".
  - **API:** `contentCardHtml(item, opts)` – add e.g. `opts.processingIds` (Set or array) or read from a global/getter so the card can check `processingIds.has(item.id)`.
- **Detail page:** On [ui/src/pages/content-detail.js](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\pages\content-detail.js), when the content is in the processing set, show the same "Processing with AI" + small progress bar in the status area instead of "Not AI processed" / "Process with AI" button (optional; can be a follow-up).

---

## 4. Files to change


| File                                                                                                        | Changes                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [ui/src/pages/library.js](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\pages\library.js)           | 3-step modal: form → progress (indeterminate bar + "Saving link…") → on success close modal, add content_id to processing set, trigger AI in background, refresh Library Saved list (update #content-list). Expose or call a refresh function that uses the processing set when rendering cards. |
| [ui/src/core/state.js](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\core\state.js)                 | Add `processingContentIds` (Set) and getters/setters: `addProcessingId(id)`, `removeProcessingId(id)`, `getProcessingIds()`.                                                                                                                                                                     |
| [ui/src/components/ui.js](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\components\ui.js)           | In `contentCardHtml`, when `showAiStatus` and item id is in `opts.processingIds`, render small progress bar + "Processing with AI". Otherwise keep current AI / Pending.                                                                                                                         |
| [ui/src/styles/animations.css](c:\Users\rites\OneDrive\Documents\code\zunoapp\ui\src\styles\animations.css) | Add a class for a small inline indeterminate bar (e.g. `.progress-bar-inline`) reusing `loadingBarSlide` so it can be used in the modal and inside the card.                                                                                                                                     |


---

## 5. UX improvement suggestions

- **Success feedback before closing:** Optionally show a brief success state inside the modal (e.g. "Saved!" with a checkmark) for ~0.5–1 s, then auto-close and refresh the list so the user sees that the action succeeded before the list appears.
- **New item at top:** Ensure the list refresh requests content ordered by `created_at` desc (or equivalent) so the newly saved item appears at the top.
- **Polling or SSE for AI done:** When `processingContentIds` is non-empty, poll `GET /api/content` (or a lightweight status endpoint) every 10–15 s and remove ids that now have `ai_processed: true`, then refresh the list or just update that card’s DOM so "Processing with AI" is replaced by "AI" without a full page reload.
- **Accessibility:** Ensure the modal progress step and card "Processing with AI" state have `aria-live` or `role="status"` and that the progress bar has `aria-busy="true"` so screen readers announce the state.
- **Error on save:** If `POST /api/content` fails, return to the form step inside the modal (don’t close), show toast, and re-enable the Save button so the user can fix the URL and retry.
- **Error on AI:** If background `POST /api/ai/process-content` fails, remove the id from `processingContentIds` and optionally show a toast ("AI processing failed for one item"); the card will then show "Pending" and the user can retry from content detail if needed.
- **Detail page consistency:** On content detail, if the item is in `processingContentIds`, show the same "Processing with AI" + small bar and hide the "Process with AI" button until processing completes or fails.

---

## 6. Flow summary (mermaid)

```mermaid
sequenceDiagram
  participant User
  participant Modal
  participant API
  participant List

  User->>Modal: Click Save Content
  Modal->>Modal: Show progress bar, "Saving link…"
  Modal->>API: POST /api/content
  API-->>Modal: 200, content_id
  Modal->>Modal: Add content_id to processingContentIds
  Modal->>API: POST /api/ai/process-content (background)
  Modal->>Modal: closeModal()
  Modal->>List: Refresh #content-list (GET /api/content)
  List->>List: Render cards; new item shows "Processing with AI" + bar
  Note over List: When API returns ai_processed true, remove id, card shows "AI"
```



No backend schema changes required. Optional: backend could add an `ai_status` field later for more accurate "processing" state across tabs/devices; until then, client-side set is sufficient.

---

## 7. UI suggestions for better user experience

### Add-content modal

- **Clear hierarchy:** Use a slightly larger, bolder title (e.g. "Add content" or "Save a link") and keep the URL field as the single primary input so the modal feels focused.
- **Paste-friendly:** Add a "Paste" button next to the URL field that pastes from clipboard; on mobile this can be easier than long-press in the input. Ensure the input has `inputmode="url"` and `autocomplete="url"` for better keyboard behavior.
- **Empty state in list:** When the Saved list is empty and the user opens the modal, keep the existing empty state message ("Tap the + button to save your first item") visible behind the modal so context is clear; or show a one-line hint inside the modal like "Paste a link from your browser or another app."
- **Progress step:** Use a compact, centered layout for "Saving link…" (icon + label + thin progress bar) so it doesn’t feel heavy; consider a small link icon or bookmark icon above the bar for visual continuity.
- **Modal size:** On larger screens, cap the modal width (e.g. max-width 400px) so it doesn’t stretch too wide and stays easy to scan.

### Library Saved list and cards

- **New item highlight:** After refresh, briefly highlight the newly added card (e.g. soft accent border or subtle background pulse for 1–2 s) so the user can spot it immediately in the list.
- **Processing state on card:** Keep "Processing with AI" and the small progress bar in the same row as existing badges (category, platform); use a muted color (e.g. accent at 70% opacity) and a small icon (e.g. auto_awesome or hourglass_empty) so it’s visible but not noisy.
- **Skeleton for new card:** Optionally, when you know a new item was just added but the list hasn’t refetched yet, show a single skeleton card at the top that is replaced by the real card when the list loads (reduces layout shift).
- **Pull-to-refresh:** On Library Saved tab, add pull-to-refresh so users can manually refresh and see updated AI status without leaving the page.
- **Empty list CTA:** Keep the "+" FAB prominent when the list is empty; consider a short tooltip or first-time hint ("Add your first link") near the FAB on first visit.

### Content detail page

- **AI status block:** When showing "Processing with AI," use a small inline block (same style as the card: thin bar + label) in the badges area so it’s consistent with the list and doesn’t look like a full-page loader.
- **Process with AI button:** When not processing, keep the button prominent (accent color) and add a short subtitle like "Generate summary and tags" so the benefit is clear.

### Global / cross-flow

- **Toasts:** Keep success toasts short (e.g. "Link saved") and error toasts actionable (e.g. "Couldn’t save link. Check the URL and try again.").
- **Loading consistency:** Use the same indeterminate bar style in the modal and on the card so "saving" and "processing" feel like one continuous flow.
- **Reduced motion:** Respect `prefers-reduced-motion`: tone down or disable progress bar animation and highlight pulse; keep functionality the same.
- **Touch targets:** Ensure modal primary button and card actions meet minimum touch size (e.g. 44px) for comfortable use on mobile.

---

## 8. Implementation details (for implementer)

When implementing, follow this order so dependencies are in place.

### 8.1 state.js

- Add a private `Set`: `const _processingContentIds = new Set();`
- Export: `addProcessingId(id)`, `removeProcessingId(id)`, `getProcessingIds()` (return the Set), `hasProcessingId(id)`.
- When content list or detail is fetched, for each item with `ai_processed === true`, call `removeProcessingId(item.id)` so the set stays in sync.

### 8.2 animations.css

- Add `.progress-bar-inline` (container: height 4px, overflow hidden, border-radius 2px, background var(--c-border)).
- Add `.progress-bar-inline-inner` (same animation as `.global-loading-bar-inner`: `loadingBarSlide`).
- Add `@media (prefers-reduced-motion: reduce)` block: for `.progress-bar-inline-inner` and `.global-loading-bar-inner`, set `animation: none`, full width, reduced opacity so progress is still visible without motion.

### 8.3 ui.js – contentCardHtml

- Add `opts.processingIds` (Set, optional). Compute `isProcessing = showAiStatus && processingIds && processingIds.has(id)`.
- When `showAiStatus` is true:
  - If `isProcessing`: render small progress bar (use `.progress-bar-inline` and `.progress-bar-inline-inner`) + label "Processing with AI" + small icon (e.g. auto_awesome). Use `role="status"` and `aria-busy="true"` on the wrapper.
  - Else if `ai_processed`: existing "AI" + check_circle.
  - Else: existing "Pending".
- Pass `processingIds` from library when calling `contentCardHtml` for Saved list (e.g. `getProcessingIds()`).

### 8.4 library.js – add-content flow

- **openSaveContentModal:** Keep form; add `inputmode="url"` and `autocomplete="url"` to the URL input. Optional: add a "Paste" button that reads `navigator.clipboard.readText()` and sets the input value.
- **doSaveContent:** (1) Validate URL; toast if empty. (2) Replace modal body with progress step: centered "Saving link…" label + `.progress-bar-inline` (do not use global showProgress). (3) Await `POST /api/content`. (4) On success: call `addProcessingId(res.data.id)`, call `POST /api/ai/process-content` in background (no await; in catch remove id and optionally toast). Close modal, toast "Link saved", call `refreshSavedListOnly(newItemId)` (see below). Do not navigate away. (5) On error: replace modal body back to form step, toast error, re-enable Save button.
- **refreshSavedListOnly(contentId):** Only run if current route is `#library` or `#library/saved` and `_libraryTab === 'saved'`. Fetch `GET /api/content` with `limit: 50`. For each item in response with `ai_processed === true`, call `removeProcessingId(item.id)`. Replace `#content-list` innerHTML with items rendered via `contentCardHtml(item, { showAiStatus: true, processingIds: getProcessingIds() })`. If `contentId` is provided, add a temporary class or data attribute to the card with that id for "new item highlight" (e.g. 1.5s accent border then remove).
- **renderLibrarySaved:** When building the list, pass `processingIds: getProcessingIds()` into `contentCardHtml`.
- Optional: when `getProcessingIds().size > 0`, start an interval (e.g. 12s) that fetches content list, removes processed ids from the set, and updates only the affected card or re-renders the list; clear the interval when set is empty.

### 8.5 content-detail.js

- Import `hasProcessingId`, `addProcessingId`, `removeProcessingId` from state.
- In the badges/status area: if `hasProcessingId(c.id)` is true, show the same "Processing with AI" block (small progress bar + label) and hide the "Process with AI" button. When the user navigates to this page after save, the card in the list already shows processing; detail should match.
- In `processWithAI`: before calling API, call `addProcessingId(contentId)`. On success, call `removeProcessingId(contentId)` and re-render. On failure, call `removeProcessingId(contentId)`, toast, restore button.

### 8.6 Backend

- No changes. Content list already ordered by `created_at` desc in [backend/app/routers/content.py](c:\Users\rites\OneDrive\Documents\code\zunoapp\backend\app\routers\content.py).

---

## 9. Optimizations (add to plan)

These optimizations should be applied when implementing the above.

### Performance

- **List refresh:** Refresh only `#content-list` (partial update) instead of re-running the full router when the add-content modal closes after save; avoids full page re-paint and preserves scroll position if needed.
- **Polling:** When `processingContentIds` is non-empty, poll `GET /api/content` (or a minimal status endpoint if added later) every 10–15 s; remove ids that now have `ai_processed: true` and update only the changed cards or re-render the list once. Stop polling when the set is empty.
- **Timeout:** Clear an id from `processingContentIds` after e.g. 2 minutes if still not `ai_processed`, to avoid stale "Processing with AI" state if the backend never responds.

### UX

- **New item highlight:** After refreshing the list post-save, add a short-lived class (e.g. `new-item-highlight`) to the card whose id matches the newly saved content; remove after 1.5–2 s. Use CSS: accent border or subtle background pulse; respect `prefers-reduced-motion` (no or minimal animation).
- **Success feedback:** Optionally show "Saved!" with checkmark inside the modal for ~0.5 s before closing, so the user sees explicit success before the list appears.
- **Error recovery:** On save failure, stay in the modal and restore the form so the user can correct the URL and retry without re-opening the modal.

### Accessibility

- **Live regions:** Modal progress step and card "Processing with AI" use `role="status"` and `aria-busy="true"` where appropriate so screen readers announce the state.
- **Reduced motion:** `prefers-reduced-motion: reduce` disables or simplifies progress bar animation and new-item highlight animation; functionality unchanged.
- **Touch targets:** Primary modal button and card actions remain at least 44px for touch.

### Consistency

- **Loading style:** Use the same indeterminate bar (`.progress-bar-inline`) in the add-content modal and on the content card so "Saving link" and "Processing with AI" feel like one flow.
- **Toasts:** Success: "Link saved". Error: "Couldn’t save link. Check the URL and try again." Keep messages short and actionable.