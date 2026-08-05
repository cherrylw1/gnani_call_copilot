# User Workflow Context

The user is an Inside Sales Representative at gnani.ai.

The user focuses on the USA market.

The user is currently doing post-event outreach after CCW Las Vegas.

The working lead list has around 1,600+ contacts assigned to the user.

The broader event list had around 3,600 leads, but this app is only for the user's assigned list.

The user’s job is mainly:

- cold calling
- sending follow-up emails
- setting up meetings for the sales team

The user does not own the full sales cycle after the meeting is set.

The app should optimize for speed during live calling.

Main daily workflow:

1. Open the call cockpit.
2. Paste or search a prospect email.
3. Instantly see contact, company, and CSV-signal context.
4. Generate a short call card.
5. Use the opener, pitch angle, and discovery questions during the call.
6. Save call notes and call outcome.
7. Generate a short follow-up email if needed.
8. Copy the email and send it manually outside the app.

The app should not send emails automatically in Phase 1.

The app should not place calls automatically.

The app should not scrape LinkedIn.

The app should not use paid crawling APIs.

The app should use OpenRouter for LLM generation.

Primary model:

deepseek/deepseek-v4-flash-0731

Fallback model:

google/gemini-3.5-flash-lite
