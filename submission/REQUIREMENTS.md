# Delivery audit

Updated 2026-10-17. The user's latest direction is a **solo submission with explicitly synthetic evaluation data** and narration using their **existing MiniMax cloned voice**.

| Requirement | Implementation / evidence |
|---|---|
| F1 manual hold | MV3 Alt+H command, popup button, actual content-script capture exercised by browser check |
| F2 structural capture | `extension/content.js`: URL/title/headings/field labels and booleans/focus/scroll; browser check confirms known typed values absent |
| F3 short cue | Shared local fallback plus optional deployed Workers AI endpoint; tests validate length and sentence checks; `artifacts/live-ai-check.json` |
| F4 return banner | Isolated shadow-root banner, visibility listener, Continue/Done; browser check |
| F5 resume next field | Next required-empty heuristic, label validation, scroll/focus/highlight; browser check |
| F6 places list and correction | Popup cards with hostname, time, cue, note edit, delete; screenshot and browser check |
| F7 local storage | chrome.storage.local; no cloud database; offline capture browser check |
| F8 note | Typed note, editable after save; OS dictation can be used, no built-in recognizer |
| F9 spoken cue | Browser speech synthesis, text/both/spoken settings; availability depends on browser/OS |
| F10 expiry | 1/24/168 hours, alarm and read cleanup; expired-place browser check |
| F11/F12 Could features | Continuous voice trigger and automatic interruption suggestions intentionally omitted per PRD scope-cut order |
| Control and privacy | Exact AI preview, opt-in per request, sensitive-site block, Submit/Pay warning, full wipe; tests and browser check |
| Accessibility | Native controls, keyboard operation, visible focus, no banner animation, browser zoom, ARIA live cue; manual screen-reader certification not claimed |
| Hosted interactive demo | Five-step practice form, library variant, local demo state, editable note, AI, wipe; desktop/mobile screenshots |
| Cloudflare deployment | Workers + Static Assets/CDN + Workers AI + rate-limit binding; deployed health and AI checks |
| Minimal implementation | No frontend framework or runtime npm dependencies; no unnecessary server storage |
| Research | Three primary/authoritative sources linked and explained in README |
| Evaluation | User-approved synthetic illustration with raw CSV and reproducible calculations; no invented human interview quotes or efficacy claims |
| Recorded demo | Actual browser interactions, MiniMax clone `moss_audio_ff64ff57-9268-11f1-834d-364bc9e5c396`, captions, downloadable MP4, public watch page |
| Pitch | Six-slide printable HTML pitch at `/pitch` |
| Submission copy | `DEVPOST.md`, research/disclosure/architecture/risks/adoption/solo contributor details |
| Source access | https://github.com/1aifanatic/hold-my-place (verify remote commit after final push) |

Operational limits: ordinary top-level web forms only; browser-restricted pages, PDF viewers, embedded frames and arbitrary closed shadow roots are outside coverage. Form answers are never restored. Rule-based sensitive-site detection and AI output constraints do not guarantee correctness. Real participant validation remains future work, with the synthetic illustration explicitly separated.

Submission itself is not performed. The event overview and full rules conflict about eligibility and deadline time; use the earlier 11:45 PM EDT October 21 deadline and confirm solo eligibility with organizers. The full rules explicitly allow individual participation, while the overview says team required. Finalist attendance is October 24 in Charlotte.
