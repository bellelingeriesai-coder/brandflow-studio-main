// Image generation calls Gemini directly from the browser, so the access unlock and the Gemini API key
// must live in the browser too. The old server-session version kept the key in an httpOnly cookie and its
// getGeminiApiKey() returned null, which made "Generate" reopen the login dialog right after logging in.
// Dev (`vite dev`) and the static GitHub Pages build now share one implementation.
export * from "./staticStudioAuth";
