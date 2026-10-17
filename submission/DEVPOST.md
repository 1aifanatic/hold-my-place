# Hold My Place

**Tagline:** A pause shouldn’t mean starting over.

**Primary track:** AI for Accessibility and Disability Inclusion

**Demo:** https://hold-my-place.aiconic-innovations.workers.dev

**Recorded demo (MiniMax cloned voice):** https://hold-my-place.aiconic-innovations.workers.dev/watch

**Pitch deck:** https://hold-my-place.aiconic-innovations.workers.dev/pitch

**Team:** Solo — Naveen Chatlapalli.

**Source:** https://github.com/1aifanatic/hold-my-place

**Synthetic evaluation (not participant results):** https://hold-my-place.aiconic-innovations.workers.dev/evaluation

## Inspiration / problem

Browsers remember tabs, but not the intention behind them. Someone renewing a licence can return from a phone call to the same page and still not know what to do next. People with attention, working-memory or executive-function difficulties may face this repeatedly. Bookmarks preserve a destination; our prototype preserves the context needed to continue.

The design is grounded in cognitive-accessibility guidance from W3C and published task-interruption research linked in the README. We have not yet interviewed participants or measured clinical or accessibility outcomes.

## What it does

Hold My Place is a Chrome/Edge extension. Press Alt+H or use its toolbar button to save a page’s structure. On return, a short cue explains the next step. Continue focuses and highlights the next incomplete field. Users can inspect the capture, edit their note, hear the cue, delete a place, configure expiry, or forget everything.

A hosted five-step practice form lets judges try the flow without installing anything. It uses a separate local demo store; the real extension can be downloaded and loaded unpacked.

## How we built it

Plain JavaScript, Manifest V3, chrome.storage.local and Web Speech synthesis keep the core small. Cloudflare Workers and Static Assets host the public demo and an optional inference API. A rate-limit binding limits AI requests. Workers AI uses Meta Llama 3.3 to produce a structured, concise cue from user-reviewed metadata. Rule-based cues preserve offline behavior and survive AI failure.

There is no backend database, account, synchronization or telemetry. The default extension path makes no network request. Optional AI sends a bounded allowlist of titles, headings, field labels and fill-state flags, focused label, step and note. It never sends typed field values. A preview makes the boundary inspectable.

## Challenges and responsible design

The hard boundary is helping people resume without collecting their answers or acting for them. Capture and next-field selection must work across ordinary forms, while uncertain states must not become confident instructions. Focus on Submit/Pay triggers a check-first warning. Sensitive-site keywords block cloud AI, though metadata still deserves manual review. People can correct the cue. Nothing is autofilled or submitted.

AI output and page markup can both be wrong. Dynamic forms, embedded frames, inaccessible labels, restricted browser pages, language differences and speech-engine behavior limit coverage. The prototype needs a human accessibility audit and participant testing. We do not claim WCAG certification or measured improvements.

## What we’re proud of

A working extension and hosted demonstration with the same small cue policy. Real-browser checks exercise capture, absence of known typed values in storage, banner navigation, note correction and deletion. Optional AI has a real deployment, while the local path remains useful on its own. Privacy and user control shape the architecture rather than appearing only in a disclaimer.

## Impact and what’s next

The submission includes an explicitly synthetic example dataset to illustrate the evaluation method. These are invented scenarios, not participant observations or measured benefits. The planned real study is a small, counterbalanced within-subject comparison using two comparable mock tasks and a five-minute interruption. Primary measures are completion rate and time to the first correct action; secondary measures are re-reading, duplicate actions, perceived effort and cue accuracy. PRD improvement targets are hypotheses, not results.

Adoption starts with user feedback and accessibility testing, then browser-store review, a clearer permission onboarding flow, robustness across real websites and multilingual evaluation. Local storage scales without a central personal-data service; optional inference scales on Cloudflare with quotas, budget controls and abuse mitigation. Hosted AI adds network dependence and cost, which is why it remains optional.

## Team and attribution

Solo contributor: Naveen Chatlapalli — product owner and project direction. Tool disclosure: OpenAI Codex assisted implementation, tests, documentation and recording automation. Cloudflare Workers AI / Meta Llama 3.3 provides optional inference. MiniMax generated narration using the owner's existing cloned voice. Playwright / FFmpeg support browser recording and media assembly. Package licenses and reused narration-tooling provenance are disclosed in the README. AI tools are not team members.

## Submission checks

- Attach the public GitHub source link and demo/video links after they are verified.
- Add screenshot evidence from `artifacts/`.
- Confirm actual team members and their contributions; do not add fictitious participants.
- Confirm eligibility with the organizer: overview says students/team/US only, but full rules say students/professionals and individual/team up to five. These conflict.
- Submit before the earlier displayed deadline: **October 21, 2026 at 11:45 PM EDT**; the rules table says 11:59 PM. Do not rely on the later time.
- Finalist presentation is October 24 in Charlotte; confirm availability or discuss exceptions with organizers.
- Declare Codex, Workers AI, MiniMax and pre-existing tooling.

Sources checked October 17, 2026: https://ieee-ai-hack-for-humanity.devpost.com/ and https://ieee-ai-hack-for-humanity.devpost.com/rules . This file is submission copy, not evidence that a Devpost entry has been submitted.
