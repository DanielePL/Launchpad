/**
 * AI Generation Service using Anthropic Claude
 * Generates app store content like descriptions, privacy policies, etc.
 */

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

interface GenerationContext {
  appName: string;
  category?: string;
  shortDescription?: string;
  platforms?: string[];
  targetAudience?: string[];
  hasAds?: boolean;
  hasIAP?: boolean;
  monetization?: string;
}

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 1024
): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Anthropic API key not configured");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Claude API error:", error);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Generate a short description for the app store (max 80 characters)
 */
export async function generateShortDescription(context: GenerationContext): Promise<string> {
  const systemPrompt = `Du bist ein App Store Optimization Experte. Generiere eine kurze, prägnante App-Beschreibung.

REGELN:
- MAXIMAL 80 Zeichen (sehr wichtig!)
- Deutsch
- Keine Emojis
- Kein Punkt am Ende
- Beschreibe den Hauptnutzen der App
- Mach neugierig`;

  const userPrompt = `App Name: ${context.appName}
Kategorie: ${context.category || "Allgemein"}

Generiere NUR die Kurzbeschreibung (max 80 Zeichen), nichts anderes.`;

  const result = await callClaude(systemPrompt, userPrompt, 100);
  // Ensure it's max 80 chars
  return result.trim().slice(0, 80);
}

/**
 * Generate a full app store description (max 4000 characters)
 */
export async function generateFullDescription(context: GenerationContext): Promise<string> {
  const systemPrompt = `Du bist ein App Store Optimization Experte. Generiere eine überzeugende App-Beschreibung für den Google Play Store / Apple App Store.

REGELN:
- Deutsch
- Max 4000 Zeichen
- Struktur mit Emojis als Überschriften
- Features als Bullet Points (•)
- Call-to-Action am Ende
- Professionell aber einladend
- Keine Übertreibungen oder leere Versprechen`;

  const userPrompt = `App Name: ${context.appName}
Kategorie: ${context.category || "Allgemein"}
Kurzbeschreibung: ${context.shortDescription || ""}
Plattformen: ${context.platforms?.join(", ") || "Android, iOS"}
Zielgruppe: ${context.targetAudience?.join(", ") || "Alle"}
Werbung: ${context.hasAds ? "Ja" : "Nein"}
In-App-Käufe: ${context.hasIAP ? "Ja" : "Nein"}
Monetarisierung: ${context.monetization || "Kostenlos"}

Generiere eine vollständige App Store Beschreibung.`;

  const result = await callClaude(systemPrompt, userPrompt, 2000);
  return result.trim().slice(0, 4000);
}

/**
 * Generate a privacy policy for the app
 */
export async function generatePrivacyPolicy(context: GenerationContext): Promise<string> {
  const systemPrompt = `Du bist ein Datenschutz-Experte. Generiere eine DSGVO-konforme Datenschutzerklärung für eine mobile App.

REGELN:
- Deutsch
- Rechtlich fundiert aber verständlich
- Alle notwendigen Abschnitte (Datenerhebung, Zweck, Rechte, etc.)
- Markdown-Formatierung
- Platzhalter für [FIRMENNAME], [ADRESSE], [EMAIL] wo nötig`;

  const userPrompt = `App Name: ${context.appName}
Plattformen: ${context.platforms?.join(", ") || "Android, iOS"}
Enthält Werbung: ${context.hasAds ? "Ja (z.B. Google AdMob)" : "Nein"}
In-App-Käufe: ${context.hasIAP ? "Ja" : "Nein"}
Zielgruppe: ${context.targetAudience?.join(", ") || "Alle Altersgruppen"}

Generiere eine Datenschutzerklärung für diese App.`;

  const result = await callClaude(systemPrompt, userPrompt, 3000);
  return result.trim();
}

/**
 * Generate keywords/tags for the app
 */
export async function generateKeywords(context: GenerationContext): Promise<string[]> {
  const systemPrompt = `Du bist ein ASO (App Store Optimization) Experte. Generiere relevante Keywords für eine App.

REGELN:
- 10-15 Keywords
- Deutsch
- Mix aus allgemeinen und spezifischen Keywords
- Ein Keyword pro Zeile
- Keine Nummerierung`;

  const userPrompt = `App Name: ${context.appName}
Kategorie: ${context.category || "Allgemein"}
Beschreibung: ${context.shortDescription || ""}

Generiere relevante Keywords (ein Keyword pro Zeile).`;

  const result = await callClaude(systemPrompt, userPrompt, 500);
  return result
    .split("\n")
    .map((k) => k.trim())
    .filter((k) => k.length > 0 && k.length < 30);
}

/**
 * Analyze a GitHub repository to detect tech stack
 */
export async function analyzeGitHubRepo(repoUrl: string): Promise<{
  techStack: string;
  platforms: string[];
  appName?: string;
  description?: string;
}> {
  // Extract owner/repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  const [, owner, repo] = match;

  // Fetch repository info
  const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!repoResponse.ok) {
    throw new Error("Could not fetch repository");
  }
  const repoData = await repoResponse.json();

  // Fetch languages
  const langResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
  const languages = langResponse.ok ? await langResponse.json() : {};

  // TODO: Future enhancement - fetch and analyze config files for more accurate detection
  // const configFiles = ["package.json", "pubspec.yaml", "app.json", ...];

  let techStack = "Unknown";
  const platforms: string[] = [];

  // Detect tech stack from languages
  const langKeys = Object.keys(languages);
  if (langKeys.includes("Dart")) {
    techStack = "Flutter";
    platforms.push("android", "ios");
  } else if (langKeys.includes("TypeScript") || langKeys.includes("JavaScript")) {
    // Could be React Native, Expo, etc.
    techStack = "React Native / JavaScript";
    platforms.push("android", "ios");
  } else if (langKeys.includes("Kotlin") || langKeys.includes("Java")) {
    techStack = "Native Android (Kotlin/Java)";
    platforms.push("android");
  } else if (langKeys.includes("Swift") || langKeys.includes("Objective-C")) {
    techStack = "Native iOS (Swift)";
    platforms.push("ios");
  }

  return {
    techStack,
    platforms: platforms.length > 0 ? platforms : ["android", "ios"],
    appName: repoData.name,
    description: repoData.description,
  };
}

export const aiGenerationService = {
  generateShortDescription,
  generateFullDescription,
  generatePrivacyPolicy,
  generateKeywords,
  analyzeGitHubRepo,
};
