# PRD: Hold My Place

**Track:** AI for Accessibility and Disability Inclusion
**Version:** 0.1 (hackathon build)
**Owner:** Naveen Chatlapalli
**Status:** Draft

---

## 1. One-line summary

A browser extension that saves *where you were and what you were trying to do* when you get interrupted mid-task, and on return tells you in one sentence what to do next.

> "You were renewing your driving licence. Next step: upload the photo."

---

## 2. Problem

People with memory, attention and executive-function disabilities lose their place in multi-step online tasks after an interruption and often never finish them.

**Who this affects (primary users):**
- ADHD (adults and students)
- Acquired brain injury / concussion
- Long COVID and chemotherapy-related cognitive impairment ("brain fog")
- Early-stage dementia and mild cognitive impairment
- Anyone under acute stress, fatigue or pain (secondary benefit)

**What goes wrong today:**
- A phone call, a child, a notification or a dizzy spell pulls the user away from a form, checkout, application or email.
- On return the browser tab is still open, but the *intent* is gone: "Why am I on this page? Did I already submit? Which field was I on?"
- The user either abandons the task, restarts from scratch (and may double-submit or double-pay), or spends minutes re-reading everything to reconstruct context.
- Existing tools (bookmarks, tab groups, session restore, browser history) save the *page*, not the *goal* or the *next step*.

**Why this is an accessibility problem, not a productivity feature:**
Working-memory and task-switching deficits are core features of ADHD, brain injury and cognitive impairment. Interruption recovery is the moment those deficits do the most damage, and no mainstream product treats it as a need to be designed for.

---

## 3. Goals and non-goals

**Goals**
1. Reduce abandoned multi-step web tasks after an interruption.
2. Reduce time-to-resume (seconds from returning to the tab to taking a correct next action).
3. Keep the user fully in control: nothing is captured unless the user asks, and every saved note can be read, edited or deleted.
4. Zero data leaves the device in the default configuration.

**Non-goals (for the hackathon)**
- Autofilling or submitting forms on the user's behalf.
- Cross-device sync.
- Native mobile apps (web extension only; a responsive demo page is enough).
- Recording screens, keystrokes or passwords.

---

## 4. Target user and research basis

**Primary persona: Priya, 34, ADHD, freelance designer.**
Starts a government portal application, gets a client call, comes back 40 minutes later, cannot remember whether she pressed Submit, restarts, and is told the reference number already exists. Gives up for the day.

**Secondary persona: Daniel, 58, post-stroke.**
Can read and type but loses the thread of a task after any distraction. His partner currently sits with him for anything involving a form.

**Evidence to cite in the submission (collect during build):**
- Short interviews or a 5-question survey with 3–5 people who identify as having ADHD, brain injury or brain fog. Ask: how often do you lose your place online, what do you do when it happens, what would you want to see first when you come back.
- Published literature on working memory and task resumption after interruption (cognitive psychology; ADHD and TBI clinical sources). Cite 2–3 credible sources in the README.
- Browser-abandonment statistics for long forms and checkouts as a proxy for scale.

---

## 5. User experience

### 5.1 Core flow

1. **User is mid-task** on any website.
2. **Interruption happens.** User triggers Hold My Place by one of:
   - Keyboard shortcut (default `Alt+H`)
   - Toolbar button
   - Saying "hold my place" (optional voice trigger, off by default)
3. **Capture (under 1 second, no dialog by default).** The extension records:
   - URL and page title
   - Visible headings and labels on the page
   - Which fields are already filled vs. empty (field *names* only, never values)
   - The element that currently has focus
   - Scroll position
   - Optional: a 1-line note the user types or dictates ("waiting for the OTP")
4. **AI builds a one-sentence resume cue** from the capture:
   - *"You were on step 3 of 5 of the passport renewal. You had filled address and date of birth. Next: upload a photo."*
5. **User returns to the tab.** A small, high-contrast banner appears at the top of the page showing only the resume cue and two buttons: **Continue** and **Done with this**.
   - Continue scrolls to and highlights the next field.
   - Done with this clears the place.
6. **Task finished.** User closes the place or it auto-expires after a configurable period (default 24 hours).

### 5.2 Places list

A simple popup listing every held place as a card: site icon, one-sentence cue, time held, buttons to open, edit the note, or delete. Nothing else.

### 5.3 Accessibility and control requirements

- Fully keyboard operable; all actions have shortcuts.
- Screen-reader compatible (ARIA live region announces the resume cue once on return).
- Respects `prefers-reduced-motion`; no animation of the banner.
- Text size follows browser zoom; minimum 16px, WCAG AA contrast.
- Plain-language mode: cue limited to one sentence, max ~20 words, no jargon.
- User can switch the cue voice: text only, text + spoken aloud, spoken only.
- Every capture is visible and editable by the user before or after it is saved.
- One-click "forget everything" that wipes all stored places.

---

## 6. Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | User can hold a place on any page via shortcut or button | Must |
| F2 | Capture records URL, title, headings, field fill-state (names only), focused element, scroll position | Must |
| F3 | A one-sentence resume cue is generated from the capture | Must |
| F4 | On return to the tab, the cue is shown in a banner with Continue / Done | Must |
| F5 | Continue scrolls to and visually highlights the next incomplete field | Must |
| F6 | Popup lists all held places and allows edit / delete | Must |
| F7 | All storage is local (`chrome.storage.local`) by default | Must |
| F8 | Optional user note (typed or dictated) attached to a place | Should |
| F9 | Spoken cue via Web Speech API | Should |
| F10 | Auto-expiry of places (default 24h, user-configurable) | Should |
| F11 | Voice trigger "hold my place" | Could |
| F12 | Detect likely interruption (tab hidden > N minutes while a form is partly filled) and *offer* to hold a place — never automatic without consent | Could |

---

## 7. AI design

**Input to the model:** a compact JSON of the capture (headings, field names + filled/empty flags, focused field, breadcrumb or step indicator text, user note). **Never** field values, cookies or page body text beyond headings and labels.

**Output:** a strict JSON object:
```json
{
  "task": "Renew driving licence",
  "progress": "step 3 of 5",
  "done": ["personal details", "address"],
  "next_step": "Upload a photo",
  "cue": "You were renewing your driving licence. Next: upload a photo."
}
```

**Constraints in the system prompt:**
- One sentence, max 20 words, present tense, second person.
- If the next step is unclear, say so plainly: "You were on the payment page. Check whether payment went through before continuing."
- Never invent progress that is not in the capture.

**Fallback (no AI available):** rule-based cue built from page title + first empty required field. The product must still work offline.

**Model options:** a small hosted model behind a thin proxy for the demo, or an on-device model if the browser supports it. Document which one the demo uses and what is sent.

---

## 8. Privacy, safety and error handling

- **Default is local-only.** No account, no server, no telemetry.
- **What is never captured:** field values, passwords, payment details, page body text, screenshots.
- **AI calls are opt-in** and the settings page shows exactly what is sent. A "preview what will be sent" button displays the JSON.
- **Sensitive-site guard:** on pages whose URL or title matches banking, health or password-manager patterns, the capture runs in rule-based mode only and shows a warning before any AI call.
- **Wrong cue handling:** every banner has an "This isn't right" link that opens the note for editing and logs the correction locally for improving prompts.
- **Double-action protection:** if the capture shows a Submit/Pay button was focused, the cue leads with "Check whether this was already submitted" rather than "Submit."
- **Expiry and wipe:** places expire automatically; "forget everything" is one click and irreversible.

---

## 9. Success metrics (for the demo and judging)

Run a small within-subject test with 5–8 participants (ideally including people from the target groups), using two multi-step mock tasks of equal length. Interrupt each participant for 5 minutes mid-task. Compare with and without Hold My Place.

| Metric | Definition | Target |
|--------|------------|--------|
| Task completion rate | % of interrupted tasks finished | +25 pts vs. control |
| Time to resume | Seconds from tab return to first correct action | −50% vs. control |
| Re-reading | Scroll-back distance / time spent above the resume point | −50% |
| Double submissions | Count of repeated submit/pay actions | 0 |
| Perceived effort | 1–7 self-report after each task | ≥1.5 point improvement |
| Cue accuracy | % of cues the participant rated "correct" | ≥85% |

Report raw numbers in the README, including anything that did not improve.

---

## 10. Technical design (hackathon scope)

**Stack**
- Browser extension, Manifest V3 (Chrome and Edge; Firefox if time allows).
- Content script: DOM capture, banner injection, scroll/highlight.
- Service worker: storage, expiry, AI call via fetch.
- Popup and options pages: plain HTML/CSS/JS or a tiny framework.
- Storage: `chrome.storage.local`.
- Speech: Web Speech API (SpeechSynthesis for output, SpeechRecognition for optional input).
- AI: one hosted LLM endpoint behind a minimal proxy that adds the key; or on-device model where available.

**Capture heuristics**
- Step indicators: look for breadcrumbs, "Step X of Y", progress bars, numbered headings.
- Field state: for each `input`, `select`, `textarea` with a label, record `{name/label, required, filled: boolean}`.
- Next field: first `required` field that is empty, in DOM order after the focused element; otherwise first empty field.

**Demo plan**
1. Open a mock 5-step government form (built for the demo, realistic look).
2. Fill 2 steps, trigger Hold My Place, show the stored JSON (prove no values captured).
3. Switch tabs, come back, banner shows cue; press Continue; field highlights.
4. Show spoken cue and screen-reader announcement.
5. Show the places list, edit a note, forget everything.
6. Show the metrics table from the mini-study.

---

## 11. Milestones (48-hour build)

| Hour | Deliverable |
|------|-------------|
| 0–4 | Repo, MV3 skeleton, shortcut + button that logs a capture |
| 4–10 | DOM capture heuristics, local storage, places popup |
| 10–16 | Resume banner, Continue (scroll + highlight), Done |
| 16–22 | AI cue generation with strict JSON + rule-based fallback |
| 22–26 | Spoken cue, ARIA live region, keyboard audit |
| 26–32 | Sensitive-site guard, settings page, "preview what is sent" |
| 32–40 | Mock form, mini user test, metrics |
| 40–48 | README, demo video, pitch deck, polish |

---

## 12. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Capture heuristics fail on unusual sites | Rule-based fallback always produces at least "You were on [page title]"; show the user's own note first |
| Cue is confidently wrong | Max 20 words, "This isn't right" link, never invent progress |
| Judges question privacy of AI calls | Local-only default, visible JSON preview, sensitive-site guard |
| Perceived as a productivity gadget | Lead the pitch with personas, interview quotes and the completion-rate metric |
| Scope creep | Anything in the "Could" column is cut first |

---

## 13. Pitch framing (30 seconds)

"Browsers remember your tabs. They don't remember your *intent*. For millions of people with ADHD, brain injury or brain fog, an interruption doesn't pause a task, it ends it. Hold My Place saves what you were doing and tells you, in one sentence, what to do next. Nothing leaves your device. In our test, interrupted tasks went from X% completed to Y%."

---

## 14. Open questions

- Should the extension ever *suggest* holding a place without being asked (F12)? Needs user input; default stays manual.
- Best default expiry: 24h vs. 7 days. Ask interviewees.
- Should "Continue" also restore partially typed values on the same page? Only if the browser already retains them; the extension never stores values itself.
