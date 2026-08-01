# Codex project instructions

## Product intent and design principles

- This is a consumer-friendly app that should help people understand what their lifestyle costs, plan ahead, and avoid spending more than they can comfortably afford.
- Turn expenses with different currencies and payment schedules into clear monthly amounts. When comparing plans with real spending, keep every value on the same time basis. Clearly separate the amount someone should set aside each month from the timing of the actual payment.
- Treat predictable expenses and variable spending differently. Predictable expenses can be checked against their expected rhythm; irregular but categorized purchases are already useful and should not be presented as incomplete merely because they are not linked to a predictable expense.
- Treat savings as a positive outcome, not as harmful spending. Keep savings out of spending totals, habits, and warning signals, and present saving progress separately with encouraging feedback.
- Use plain, everyday English. Avoid technical, accounting, and financial jargon. Labels should explain what a number means without requiring the user to understand how it was calculated.
- Make the meaning and direction of comparisons immediately clear through wording, icons, and colour. Do not rely on an unsigned number or an ambiguous label to communicate whether something is above, below, or on plan.
- Be explicit about time. If information depends on a selected period, name that period instead of saying "this month" or using another relative phrase that becomes misleading when viewing older data.
- Keep information near the controls or context it depends on. Visually separate selected-period insights from longer-term patterns so users can tell which parts change with their selection.
- Only warn users about something they can and should fix. Prefer calm, positive confirmation when the data is complete, and use encouragement rather than punishment when supporting good habits.

## Browser testing

- The app resolves authentication asynchronously during client hydration. A sparse initial DOM snapshot, such as one containing only the notifications region, is a transient loading state rather than a browser-control failure.
- After navigation, allow hydration to finish and take a fresh DOM snapshot before concluding that expected controls or content are missing.
- When a protected page redirects to GitHub login, keep the in-app browser tab open and hand it to the user so they can authenticate.
- After the user confirms login, resume from the same in-app browser session, reclaim or reuse its tab, verify that a protected page loaded, and continue the requested tests.
- Treat authentication as failed only when the resumed authenticated session still cannot load or interact with the protected page.
