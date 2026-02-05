# AI Launch Assistant - Konzept

## Vision

Ein prozessorientierter AI-Assistent der beim ersten Login erscheint und den User durch den **kompletten** App-Launch-Prozess führt. Der User beantwortet nur Fragen - der Assistent füllt alles aus, generiert Content und trifft intelligente Entscheidungen.

---

## Core Principles

1. **Zero Overwhelm** - User sieht immer nur EINE Frage/Aufgabe
2. **Maximum Automation** - Alles was automatisiert werden kann, WIRD automatisiert
3. **Smart Defaults** - AI trifft Entscheidungen basierend auf Kontext
4. **Live Protocol** - Visuelles Fortschritts-Protokoll läuft nebenbei mit
5. **Pausierbar** - Kann jederzeit unterbrochen und fortgesetzt werden

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  LAUNCH ASSISTANT                              Progress: 3/12   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │   "Wie heißt deine App?"                               │   │
│  │                                                         │   │
│  │   ┌─────────────────────────────────────────────┐      │   │
│  │   │ FitTracker Pro                              │      │   │
│  │   └─────────────────────────────────────────────┘      │   │
│  │                                                         │   │
│  │   [Weiter →]                                           │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─ PROTOKOLL ─────────────────────────────────────────────┐   │
│  │  ✓ App-Name: FitTracker Pro                             │   │
│  │  ○ App-Beschreibung                                     │   │
│  │  ○ Tech-Stack                                           │   │
│  │  ○ Plattformen                                          │   │
│  │  ○ Store Listings                                       │   │
│  │  ○ Assets                                               │   │
│  │  ○ Compliance                                           │   │
│  │  ○ Beta-Strategie                                       │   │
│  │  ○ Release                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phasen & Fragen

### Phase 1: Discovery (Basics)

| # | Frage | Input-Typ | Auto-Fill |
|---|-------|-----------|-----------|
| 1 | Wie heißt deine App? | Text | - |
| 2 | Was macht deine App? (1-2 Sätze) | Textarea | - |
| 3 | Hast du ein Repository oder lokalen Pfad? | URL/Path (optional) | Analysiert Code → Tech-Stack, Features |
| 4 | Welche Plattformen? | Multi-Select | Auto-detect aus Code |

### Phase 2: Tech Analysis (wenn Repo gegeben)

AI analysiert automatisch:
- **Tech-Stack**: React Native, Flutter, Swift, Kotlin, PWA...
- **Dependencies**: Was wird verwendet?
- **App-Typ**: Game, Utility, Social...
- **Features**: Push Notifications, In-App Purchases, Auth...
- **Permissions**: Kamera, Location, Storage...

```
"Ich habe dein Repository analysiert:

 ✓ React Native App (TypeScript)
 ✓ Expo SDK 51
 ✓ Features: Push Notifications, Auth, Camera
 ✓ Ziel-Plattformen: iOS & Android

 Stimmt das?"

 [Ja, weiter] [Nein, korrigieren]
```

### Phase 3: Store Presence

| # | Frage | Input-Typ | AI-Action |
|---|-------|-----------|-----------|
| 5 | Hast du einen Google Play Console Account? | Ja/Nein/Was ist das? | Link + Anleitung wenn Nein |
| 6 | Hast du einen Apple Developer Account? | Ja/Nein/Was ist das? | Link + Anleitung wenn Nein |
| 7 | Soll ich die Store-Beschreibungen generieren? | Ja/Nein | **AI generiert alle Texte** |

### Phase 4: Store Listings (AI-Generated)

```
"Basierend auf deiner App-Beschreibung habe ich folgende
 Store-Texte erstellt:"

 ┌─ KURZBESCHREIBUNG (80 Zeichen) ─────────────────────┐
 │ Tracke deine Fitness-Ziele mit KI-gestützten       │
 │ Workout-Plänen                                      │
 └─────────────────────────────────────────────────────┘

 ┌─ VOLLSTÄNDIGE BESCHREIBUNG ─────────────────────────┐
 │ FitTracker Pro ist dein persönlicher Fitness-      │
 │ Assistent...                                        │
 │ [4000 Zeichen generiert]                           │
 └─────────────────────────────────────────────────────┘

 ┌─ KEYWORDS (iOS) ────────────────────────────────────┐
 │ fitness,workout,tracker,health,training,gym...     │
 └─────────────────────────────────────────────────────┘

 [Übernehmen] [Bearbeiten] [Neu generieren]
```

### Phase 5: Assets

| # | Frage | Input-Typ | AI-Action |
|---|-------|-----------|-----------|
| 8 | Hast du ein App-Icon? | Upload/Nein | Generiert Varianten für alle Größen |
| 9 | Hast du Screenshots? | Upload/Nein | Zeigt welche Größen fehlen |
| 10 | Soll ich Screenshot-Mockups erstellen? | Ja/Nein | **AI erstellt Device-Frames** |

### Phase 6: Compliance

```
"Für den App Store brauchst du diese Dokumente:"

 ┌─ PRIVACY POLICY ────────────────────────────────────┐
 │ ✓ Generiert basierend auf erkannten Features       │
 │   - Datensammlung: E-Mail, Fitness-Daten           │
 │   - Third-Party: Firebase Analytics                │
 │   [Vorschau] [Bearbeiten]                          │
 └─────────────────────────────────────────────────────┘

 ┌─ DATA SAFETY (Android) ─────────────────────────────┐
 │ ✓ Automatisch ausgefüllt                           │
 │   [Vorschau]                                        │
 └─────────────────────────────────────────────────────┘

 ┌─ APP PRIVACY (iOS) ─────────────────────────────────┐
 │ ✓ Automatisch ausgefüllt                           │
 │   [Vorschau]                                        │
 └─────────────────────────────────────────────────────┘
```

### Phase 7: Beta Strategy

| # | Frage | Input-Typ | AI-Action |
|---|-------|-----------|-----------|
| 11 | Willst du erst einen Beta-Test machen? | Ja/Nein | Empfiehlt basierend auf App-Komplexität |
| 12 | Wie viele Tester? | Number/Skip | Richtet TestFlight/Internal Testing ein |
| 13 | Hast du Tester-E-Mails? | Import/Skip | Lädt Tester ein |

### Phase 8: Release

```
"Dein Launch-Plan ist fertig!"

 ┌─ TIMELINE ──────────────────────────────────────────┐
 │                                                     │
 │  Heute ────○ Projekt erstellt                      │
 │            │                                        │
 │  Tag 2 ────○ Store Listings finalisieren           │
 │            │                                        │
 │  Tag 3 ────○ Assets hochladen                      │
 │            │                                        │
 │  Tag 5 ────○ Beta-Test starten                     │
 │            │                                        │
 │  Tag 12 ───○ Feedback einarbeiten                  │
 │            │                                        │
 │  Tag 14 ───○ Zur Review einreichen                 │
 │            │                                        │
 │  Tag 17 ───○ 🚀 LAUNCH                             │
 │                                                     │
 └─────────────────────────────────────────────────────┘

 [Projekt starten →]
```

---

## AI Capabilities

### 1. Code Analysis
```typescript
interface RepoAnalysis {
  tech_stack: TechStack;
  framework_version: string;
  platforms: Platform[];
  features: AppFeature[];
  permissions: Permission[];
  dependencies: Dependency[];
  app_type_suggestion: AppType;
}
```

**Unterstützt:**
- GitHub/GitLab URL → Clone & Analyze
- Local Path → Direct Analysis
- package.json, Podfile, build.gradle parsing
- README.md für App-Beschreibung

### 2. Content Generation
- **Store Descriptions**: Kurz, Lang, Keywords
- **Release Notes**: Basierend auf Git commits
- **Privacy Policy**: Basierend auf erkannten Features
- **Support Text**: FAQ, Kontakt-Templates

### 3. Asset Intelligence
- Icon-Größen generieren (alle Plattformen)
- Screenshot-Mockups mit Device-Frames
- Feature Graphic Vorschläge
- Promo-Video Storyboard

### 4. Smart Recommendations
- Beta-Test Dauer basierend auf App-Komplexität
- Kategorie-Empfehlung basierend auf Features
- Pricing-Strategie (Free, Paid, Freemium)
- Launch-Timing (beste Wochentage)

---

## Datenmodell

### Assistant Session
```typescript
interface AssistantSession {
  id: string;
  project_id: string;
  current_phase: AssistantPhase;
  current_step: number;
  answers: Record<string, any>;
  generated_content: GeneratedContent;
  repo_analysis?: RepoAnalysis;
  started_at: string;
  last_activity_at: string;
  completed_at?: string;
}

type AssistantPhase =
  | "discovery"
  | "tech_analysis"
  | "store_presence"
  | "store_listings"
  | "assets"
  | "compliance"
  | "beta_strategy"
  | "release"
  | "completed";
```

### Protocol Steps
```typescript
interface ProtocolStep {
  id: string;
  phase: AssistantPhase;
  label: string;
  status: "pending" | "active" | "completed" | "skipped";
  value?: string;
  generated?: boolean; // AI-generated content
  timestamp?: string;
}
```

---

## UI Components

```
src/components/app-launch/assistant/
├── LaunchAssistant.tsx          # Main orchestrator
├── AssistantChat.tsx            # Chat/Question UI
├── ProtocolSidebar.tsx          # Live progress protocol
├── QuestionRenderer.tsx         # Dynamic question types
├── ContentPreview.tsx           # Generated content preview
├── RepoAnalyzer.tsx             # Repo analysis UI
├── ContentEditor.tsx            # Edit generated content
└── index.ts
```

---

## Backend Requirements

### API Endpoints
```typescript
// Session Management
POST   /api/assistant/start          // Start new session
GET    /api/assistant/:sessionId     // Get session state
POST   /api/assistant/:sessionId/answer  // Submit answer
POST   /api/assistant/:sessionId/skip    // Skip step
POST   /api/assistant/:sessionId/back    // Go back

// AI Generation
POST   /api/assistant/analyze-repo   // Analyze repository
POST   /api/assistant/generate/description
POST   /api/assistant/generate/keywords
POST   /api/assistant/generate/privacy-policy
POST   /api/assistant/generate/release-notes

// Asset Generation
POST   /api/assistant/generate/icon-sizes
POST   /api/assistant/generate/screenshot-mockup
```

### Supabase Edge Functions
```
supabase/functions/
├── assistant-analyze-repo/     # Repo analysis
├── assistant-generate-content/ # AI content generation
└── assistant-generate-assets/  # Asset processing
```

---

## Implementation Priority

### MVP (Phase 1)
1. ✅ Basic question flow (already built)
2. ⬜ Protocol sidebar with live updates
3. ⬜ AI content generation (descriptions)
4. ⬜ Session persistence (resume later)

### Phase 2
5. ⬜ Repository analysis (GitHub URL)
6. ⬜ Privacy Policy generator
7. ⬜ Smart recommendations

### Phase 3
8. ⬜ Local path analysis
9. ⬜ Asset generation
10. ⬜ Beta test automation

---

## Differentiator

**Was andere Tools NICHT haben:**

| Feature | Andere | Launchpad |
|---------|--------|-----------|
| Store Text generieren | ❌ | ✅ AI-powered |
| Code analysieren | ❌ | ✅ Tech-Stack erkennen |
| Privacy Policy | ❌ | ✅ Auto-generiert |
| Permissions erkennen | ❌ | ✅ Aus Code |
| One-question-at-a-time | ❌ | ✅ Zero Overwhelm |
| Visual Protocol | ❌ | ✅ Live Updates |

---

## Technische Anforderungen

- **Claude API**: Content Generation
- **GitHub API**: Repository Access
- **Supabase Edge Functions**: Serverless Processing
- **React Query**: State Management
- **Zustand**: UI State für Assistant

---

## Fragen an dich

1. **Repo-Analyse**: Sollen wir mit GitHub URLs starten oder auch lokale Pfade?
2. **AI-Provider**: Claude API direkt oder über Supabase Edge Function?
3. **Asset-Generation**: Sollen wir echte Icon-Generierung einbauen (DALL-E/Midjourney)?
4. **Scope MVP**: Welche Phasen sind für den ersten Release am wichtigsten?
