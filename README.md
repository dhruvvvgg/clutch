<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Clutch

**Because planning isn't execution.**

Clutch is an autonomous productivity agent that doesn't remind you about deadlines — it acts on them. Built for the Google AI Studio Hackathon, Problem Statement 1: *The Last-Minute Life Saver*.

[Live App](https://clutch-812031856437.asia-southeast1.run.app)


## The Problem

Every productivity tool operates in the wrong moment. They remind you a task is due, then keep pinging you as the deadline gets closer. But when the crisis actually hits — when it's 11pm and a presentation is due at 9am — none of them do anything meaningful. They just keep sending notifications you've already started ignoring.

Clutch is built to act in that moment instead.


## What It Does

Clutch operates across the full lifecycle of a deadline through three modes:

**Crisis Mode** — *"I have a deadline coming up fast."* Describe what's happening, and Clutch runs an honest Mission Assessment before doing anything else. If the deadline is achievable, it clears calendar conflicts, drafts the emails needed to buy time, and builds the actual starting point of the work — a populated Slides outline, a structured Doc, or a project scaffold — so you're never staring at a blank page.

**Plan Mode** — *"I want to get ahead of something."* For deadlines that aren't urgent yet. Clutch proactively schedules focus blocks and pre-builds your workspace days in advance.

**Review Mode** — *"Help me not repeat a mistake."* A short, honest debrief after a task wraps — what happened, where the planning gap actually was, and one concrete habit fix.

### Mission Assessment

Before Clutch does anything else, it calculates an honest completion probability based on the deadline, task type, effort required, and current progress. If the odds are reasonable, Clutch launches Crisis Mode and starts clearing the path. If the math genuinely doesn't work, Clutch switches into **Damage Control Mode** instead — drafting a professional extension request with a realistic revised timeline rather than setting the user up to fail.

Most productivity tools are optimistic by default. Clutch is honest instead.


## Architecture

Clutch is a genuine multi-agent system, not a single AI call wrapped in a UI. Five specialized agents, each a distinct API endpoint with its own tuned system instructions and function-calling schema:

| Agent | Endpoint | Role |
|---|---|---|
| Intake | `/api/intake` | Parses natural language input into a structured task profile |
| Mission Assessment | `/api/assess` | Calculates completion probability and routes Crisis vs. Damage Control |
| Calendar | `/api/calendar` | Reads, classifies, and proposes calendar changes for approval |
| Gmail | `/api/gmail` | Drafts cancellation, postponement, and extension emails |
| Bootstrap | `/api/bootstrap` | Builds the populated starting document, deck, or scaffold |

The Bootstrap Agent runs with **Google Search grounding** explicitly enabled, so the content it generates is grounded in real, current information rather than generic filler.

Nothing writes to a calendar or sends an email without explicit user approval. Every agent prepares changes; the user confirms them.


## Tech Stack

**Frontend** — React 19, Tailwind CSS, Motion, Lucide React
**Backend** — Express on Node.js
**AI** — Gemini API via `@google/genai`, built and tuned in Google AI Studio
**Data** — Firebase Firestore (session history, debrief logs), Firebase Auth
**Build** — Vite, esbuild, tsx, TypeScript end to end


## Google Technologies Used

- **Google AI Studio** — core development environment for every agent prompt and function-calling schema
- **Gemini API** — reasoning engine across all five agents
- **Gemini Function Calling** — autonomous multi-step tool orchestration per agent
- **Google Search Grounding** — enabled on the Bootstrap Agent
- **Google Calendar API** — read, classify, and write calendar events
- **Gmail API** — draft generation (drafts only, never auto-sent)
- **Google Docs API** / **Google Slides API** — Bootstrap Agent document and deck creation
- **Google OAuth 2.0** — authentication
- **Firebase** — Firestore + Auth


## Judge Demo Mode

Our app currently operates under Google's testing-mode OAuth restrictions — full production verification for sensitive scopes (Calendar, Gmail, Docs, Slides) was still pending at submission time, given the timeline of this challenge.

To make sure the full agent pipeline can still be evaluated, Clutch includes a **Demo Mode** accessible from the footer on any screen. It runs the complete Crisis Mode flow end to end — Intake through Mission Assessment, Calendar Agent, Gmail Agent, and Bootstrap Agent — without requiring OAuth completion.


## Running Locally

```bash
git clone https://github.com/dhruvvvgg/clutch.git
cd clutch
npm install
```

Set up your environment variables (Gemini API key, Firebase config, Google OAuth client credentials) in a `.env` file, then:

```bash
npm run dev
```


## Why "Clutch"

Because the moment that actually matters isn't when the deadline was set. It's right now, when there's no time left and something still needs to get done. That's when Clutch shows up.
