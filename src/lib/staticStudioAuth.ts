const ACCESS_PASSWORD = "belle@4565";
const AUTH_KEY = "studioflow.staticUnlocked";
const GEMINI_KEY = "studioflow.geminiApiKey";

export interface StudioAuthState {
  unlocked: boolean;
  hasGeminiKey: boolean;
}

export const emptyAuth: StudioAuthState = {
  unlocked: false,
  hasGeminiKey: false,
};

function storageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export async function getStudioAuth(): Promise<StudioAuthState> {
  const unlocked =
    storageAvailable() &&
    window.localStorage.getItem(AUTH_KEY) === "true" &&
    Boolean(window.localStorage.getItem(GEMINI_KEY));
  return {
    unlocked,
    hasGeminiKey: unlocked,
  };
}

export async function unlockStudio({
  data,
}: {
  data: { password: string; geminiApiKey: string };
}): Promise<StudioAuthState | (StudioAuthState & { error: string })> {
  const geminiApiKey = data.geminiApiKey.trim();

  if (data.password !== ACCESS_PASSWORD) {
    return { ...emptyAuth, error: "Access password is incorrect." };
  }

  if (!geminiApiKey) {
    return { ...emptyAuth, error: "Paste your Gemini API key to continue." };
  }

  // GitHub Pages is static, so there is no secure backend session. Remember the
  // unlock + key on this device so the user isn't asked again until they log out.
  if (storageAvailable()) {
    window.localStorage.setItem(AUTH_KEY, "true");
    window.localStorage.setItem(GEMINI_KEY, geminiApiKey);
  }

  return {
    unlocked: true,
    hasGeminiKey: true,
  };
}

export async function logoutStudio(): Promise<StudioAuthState> {
  if (storageAvailable()) {
    window.localStorage.removeItem(AUTH_KEY);
    window.localStorage.removeItem(GEMINI_KEY);
  }

  return emptyAuth;
}

export function getGeminiApiKey(): string | null {
  if (!storageAvailable()) return null;
  return window.localStorage.getItem(GEMINI_KEY);
}
