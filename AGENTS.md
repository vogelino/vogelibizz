# Codex project instructions

## Browser testing

- The app resolves authentication asynchronously during client hydration. A sparse initial DOM snapshot, such as one containing only the notifications region, is a transient loading state rather than a browser-control failure.
- After navigation, allow hydration to finish and take a fresh DOM snapshot before concluding that expected controls or content are missing.
- When a protected page redirects to GitHub login, keep the in-app browser tab open and hand it to the user so they can authenticate.
- After the user confirms login, resume from the same in-app browser session, reclaim or reuse its tab, verify that a protected page loaded, and continue the requested tests.
- Treat authentication as failed only when the resumed authenticated session still cannot load or interact with the protected page.
