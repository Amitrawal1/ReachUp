# ReachUp

**A bridge between rural talent and opportunities.**

ReachUp brings verified internships, jobs, scholarships and training programs to students in villages and small towns, in their own language (Hindi / English), and guides them until they apply.

This is the Phase 1 prototype.

## What the prototype does

- **Sign up** with mobile number + OTP (demo: any 4 digits), language choice first
- **Simple profile** in 12 one-tap questions, with voice input for the name
- **Matched feed** ranked by eligibility, interests, benefit and deadline
- **Eligibility check** rule by rule: "You are eligible ✅" or exactly what is missing, with tips to fix it
- **Scam check** that blocks fake listings (fee asked, unknown source, personal contact only, too-good pay, pressure words)
- **Detail page** with simple explanation, why it suits you, document checklist, steps to apply, read aloud, share on WhatsApp
- **Deadline reminders** with browser notifications, plus a "Due soon" list
- **My list** to track every application: Saved → Applied → Interview → Selected / Not selected (with next suggestions)
- **WhatsApp channel preview** (planned for Phase 2)
- **Works offline** after the first visit (PWA), can be installed on Android

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. Tip: use Chrome DevTools phone view (390 px wide).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  data/opportunities.js   demo opportunity list (real govt schemes + demo partners + 2 fake listings)
  lib/matching.js         eligibility check and match score
  lib/scamCheck.js        rule-based scam detection
  lib/reminders.js        deadline notifications
  lib/AppContext.jsx      language, profile and saved items (stored in the browser)
  i18n/strings.js         all Hindi and English text
  pages/                  Welcome, Profile, Feed, Detail, MyList, WhatsappPreview
  components/             shared UI pieces
public/sw.js              offline support
```

## Note on data

Government schemes are real, but amounts and rules are simplified for the demo. Companies marked "demo partner" are made up. Always check the official website before applying.
