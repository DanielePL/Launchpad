# Prometheus Admin - Brand Style Guide

## Markenidentitat

**Name:** Prometheus Admin
**Branche:** Fitness & Coaching SaaS-Plattform
**Zielgruppe:** Fitness-Coaches, Personal Trainer, Gym-Betreiber
**Markenpersonlichkeit:** Modern, Premium, Professionell, Tech-Forward

---

## 1. Hintergrund

### Light Theme Hintergrund
**Datei:** `src/assets/gradient-bg.jpg`

Ein warmer, organischer Gradient mit fliessenden Farbverlaufen:
- **Hauptfarbe:** Warmes Orange (HSL 23, 87%, 55%)
- **Sekundarfarbe:** Helles Pfirsich/Apricot
- **Akzente:** Sanfte cremefarbene Bereiche
- **Charakter:** Der Gradient hat eine wolkige, organische Struktur mit weichen Ubergangen. Die orangefarbenen Bereiche konzentrieren sich im Zentrum und oberen Bereich, wahrend die Rander in helle, fast weisse Tone ubergehen.
- **Textur:** Leichtes Rauschen (Grain) fur einen modernen, taktilen Look

### Dark Theme Hintergrund
**Datei:** `src/assets/gradient-bg-dark.png`

Ein eleganter dunkler Gradient:
- **Basis:** Tiefes Schwarz (HSL 0, 0%, 8%)
- **Akzent:** Warme, gedampfte Orange-Brauntone in der unteren rechten Ecke
- **Charakter:** Minimalistisch mit subtilen warmen Akzenten, die an gluhende Kohlen erinnern
- **Atmosphare:** Professionell und fokussiert

---

## 2. Farbpalette

### Primarfarbe - Prometheus Orange
Die Markenfarbe symbolisiert Energie, Leidenschaft und Transformation.

| Variante | HSL | HEX | RGB | Verwendung |
|----------|-----|-----|-----|------------|
| Primary | `hsl(23, 87%, 55%)` | `#F27935` | `rgb(242, 121, 53)` | Buttons, CTAs, Akzente |
| Primary Glow | `hsl(23, 87%, 65%)` | `#F5995E` | `rgb(245, 153, 94)` | Hover-States, Glow-Effekte |
| Primary Dark | `hsl(23, 87%, 45%)` | `#CC5A1A` | `rgb(204, 90, 26)` | Aktive States |

### Neutralfarben

#### Light Theme
| Farbe | HSL | Verwendung |
|-------|-----|------------|
| Background | `hsl(0, 0%, 98%)` | Haupt-Hintergrund |
| Background Secondary | `hsl(0, 0%, 95%)` | Sekundare Flachen |
| Foreground | `hsl(0, 0%, 10%)` | Haupttext |
| Muted | `hsl(0, 0%, 90%)` | Deaktivierte Elemente |
| Muted Foreground | `hsl(0, 0%, 45%)` | Sekundartext |
| Border | `hsl(0, 0%, 0% / 0.08)` | Rahmen, Trennlinien |

#### Dark Theme
| Farbe | HSL | Verwendung |
|-------|-----|------------|
| Background | `hsl(0, 0%, 8%)` | Haupt-Hintergrund |
| Background Secondary | `hsl(0, 0%, 12%)` | Sekundare Flachen |
| Foreground | `hsl(0, 0%, 98%)` | Haupttext |
| Muted | `hsl(0, 0%, 20%)` | Deaktivierte Elemente |
| Muted Foreground | `hsl(0, 0%, 60%)` | Sekundartext |
| Border | `hsl(0, 0%, 100% / 0.12)` | Rahmen, Trennlinien |

### Statusfarben

| Status | HSL | HEX | Verwendung |
|--------|-----|-----|------------|
| Success | `hsl(142, 76%, 36%)` | `#16A34A` | Erfolg, Bestatigung |
| Warning | `hsl(45, 100%, 51%)` | `#FACC15` | Warnung, Aufmerksamkeit |
| Destructive | `hsl(0, 84%, 60%)` | `#EF4444` | Fehler, Loschen |
| Info | `hsl(207, 90%, 54%)` | `#3B82F6` | Information, Hinweise |

### Kategorie-Farben (Pipeline/Charts)

| Kategorie | Tailwind-Klasse | Verwendung |
|-----------|-----------------|------------|
| Neu | `bg-blue-500` | Neue Leads |
| Kontaktiert | `bg-yellow-500` | In Kontakt |
| Demo | `bg-purple-500` | Demo-Phase |
| Verhandlung | `bg-orange-500` | Verhandlung |
| Gewonnen | `bg-green-500` | Abgeschlossen |
| Verloren | `bg-red-500` | Nicht konvertiert |

---

## 3. Typografie

### Schriftfamilien

| Schrift | Verwendung | Google Fonts Link |
|---------|------------|-------------------|
| **Space Grotesk** | Uberschriften (H1-H6) | `fonts.google.com/specimen/Space+Grotesk` |
| **Poppins** | Fliesstext, UI-Elemente | `fonts.google.com/specimen/Poppins` |

### Typografie-Hierarchie

| Element | Font | Gewicht | Grosse | Tailwind-Klassen |
|---------|------|---------|--------|------------------|
| H1 | Space Grotesk | 700 (Bold) | 2.25rem | `text-4xl font-bold` |
| H2 | Space Grotesk | 700 (Bold) | 1.875rem | `text-3xl font-bold` |
| H3 | Space Grotesk | 700 (Bold) | 1.5rem | `text-2xl font-bold` |
| H4 | Space Grotesk | 700 (Bold) | 1.25rem | `text-xl font-bold` |
| H5 | Space Grotesk | 700 (Bold) | 1.125rem | `text-lg font-bold` |
| H6 | Space Grotesk | 700 (Bold) | 1rem | `text-base font-bold` |
| Body | Poppins | 400 (Regular) | 1rem | `text-base` |
| Body Small | Poppins | 400 (Regular) | 0.875rem | `text-sm` |
| Caption | Poppins | 400 (Regular) | 0.75rem | `text-xs` |
| Button | Poppins | 500 (Medium) | 0.875rem | `text-sm font-medium` |
| Label | Poppins | 500 (Medium) | 0.875rem | `text-sm font-medium` |

### Zahlen & Metriken

Grosse Zahlen (KPIs, Statistiken):
```
text-4xl font-bold text-primary
```

---

## 4. Glassmorphism-Design

Das zentrale Designelement der Anwendung ist der Glassmorphism-Effekt.

### Light Theme Glass
```css
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}
```

### Dark Theme Glass
```css
.dark .glass {
  background: rgba(50, 50, 50, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}
```

### Hover-Effekt
```css
.glass-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-hover:hover {
  background-opacity: 60%;
  border-opacity: 20%;
}
```

---

## 5. Cards

### Basis-Card
```
Hintergrund:     hsl(0 0% 100% / 0.35)  (Light)
                 hsl(0 0% 15% / 0.4)    (Dark)
Border Radius:   rounded-lg (0.5rem) oder rounded-xl (0.75rem)
Schatten:        shadow-sm
Padding:         p-6 (1.5rem)
```

### Card-Struktur

```
+------------------------------------------+
|  CardHeader (p-6)                        |
|  +--------------------------------------+|
|  | CardTitle (text-2xl font-semibold)   ||
|  | CardDescription (text-sm muted)      ||
|  +--------------------------------------+|
+------------------------------------------+
|  CardContent (p-6 pt-0)                  |
|  [Hauptinhalt]                           |
+------------------------------------------+
|  CardFooter (p-6 pt-0)                   |
|  [Aktionen]                              |
+------------------------------------------+
```

### Card-Varianten

| Variante | Klassen | Verwendung |
|----------|---------|------------|
| Standard | `bg-card rounded-lg shadow-sm` | Allgemein |
| Stat Card | `bg-card rounded-xl p-4` | KPI-Anzeigen |
| Interactive | `bg-card hover:bg-card/80 hover:shadow-lg cursor-pointer` | Klickbare Cards |
| Featured | `bg-card border-l-4 border-primary` | Hervorgehobene Items |
| Semi-transparent | `bg-card/50 rounded-xl` | Wizard-Steps |

---

## 6. Buttons

### Button-Varianten

| Variante | Hintergrund | Text | Hover |
|----------|-------------|------|-------|
| **Default (Primary)** | `bg-primary` | `text-white` | `bg-primary/90` |
| **Secondary** | `bg-secondary` | `text-secondary-foreground` | `bg-secondary/80` |
| **Outline** | `transparent + border` | `text-foreground` | `bg-accent` |
| **Ghost** | `transparent` | `text-foreground` | `bg-accent` |
| **Destructive** | `bg-destructive` | `text-white` | `bg-destructive/90` |
| **Link** | `transparent` | `text-primary` | `underline` |

### Button-Grossen

| Grosse | Hohe | Padding | Verwendung |
|--------|------|---------|------------|
| **Small (sm)** | h-9 | px-3 | Kompakte UIs |
| **Default** | h-10 | px-4 py-2 | Standard |
| **Large (lg)** | h-11 | px-8 | Hero-Sections, CTAs |
| **Icon** | h-10 w-10 | - | Icon-Only Buttons |

### Button-Basis-Styling
```css
inline-flex items-center justify-center
gap-2
rounded-md
text-sm font-medium
transition-colors
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
disabled:opacity-50 disabled:pointer-events-none
```

---

## 7. Input-Felder

### Standard Input
```
Hohe:            h-10 (2.5rem)
Padding:         px-3 py-2
Border:          1px solid hsl(var(--input))
Border Radius:   rounded-md
Hintergrund:     bg-background
Schrift:         text-base (mobile), text-sm (desktop)
Placeholder:     text-muted-foreground
```

### Focus-State
```css
focus-visible:ring-2
focus-visible:ring-ring (Primary Orange)
focus-visible:ring-offset-2
```

### Disabled-State
```css
opacity: 50%
cursor: not-allowed
```

---

## 8. Border Radius

| Token | Wert | Tailwind | Verwendung |
|-------|------|----------|------------|
| Base | 1.5rem (24px) | `rounded-[--radius]` | Referenzwert |
| Large | 1.5rem | `rounded-lg` | Cards, Container |
| XL | 0.75rem | `rounded-xl` | Spezielle Cards |
| 2XL | 1rem | `rounded-2xl` | Modals |
| Medium | calc(1.5rem - 2px) | `rounded-md` | Buttons, Inputs |
| Small | calc(1.5rem - 4px) | `rounded-sm` | Kleine Elemente |
| Full | 50% | `rounded-full` | Badges, Avatare |

---

## 9. Schatten & Glows

### Schatten

| Name | Wert | Verwendung |
|------|------|------------|
| Glass Shadow (Light) | `0 8px 32px 0 rgba(0, 0, 0, 0.1)` | Glassmorphism-Elemente |
| Glass Shadow (Dark) | `0 8px 32px 0 rgba(0, 0, 0, 0.4)` | Glassmorphism (Dark) |
| Soft Glow (Light) | `0 4px 20px rgba(0, 0, 0, 0.05)` | Subtile Erhebung |
| Soft Glow (Dark) | `0 4px 20px rgba(0, 0, 0, 0.3)` | Subtile Erhebung (Dark) |

### Orange Glow
```css
--glow-orange: 0 0 30px hsl(23 87% 55% / 0.3);  /* Light */
--glow-orange: 0 0 30px hsl(23 87% 55% / 0.4);  /* Dark */
```
Verwendung: Logo-Badge, Hervorgehobene Primary-Elemente

---

## 10. Layout-Struktur

### App Shell
```
+------------------+----------------------------------------+
|                  |  Header (h-16, glass, sticky)          |
|    Sidebar       +----------------------------------------+
|    (w-64,        |                                        |
|     glass,       |  Main Content (p-6)                    |
|     fixed)       |                                        |
|                  |                                        |
|                  |                                        |
+------------------+----------------------------------------+
```

### Spacing-System

| Token | Wert | Tailwind |
|-------|------|----------|
| xs | 0.25rem (4px) | `gap-1`, `p-1` |
| sm | 0.5rem (8px) | `gap-2`, `p-2` |
| md | 1rem (16px) | `gap-4`, `p-4` |
| lg | 1.5rem (24px) | `gap-6`, `p-6` |
| xl | 2rem (32px) | `gap-8`, `p-8` |

### Container Max-Width
```
2xl: 1400px (max-w-[1400px])
```

---

## 11. Navigation

### Sidebar Navigation Item

**Inaktiv:**
```
text-muted-foreground
rounded-xl
px-3 py-2
```

**Hover:**
```
bg-background/50
text-foreground
```

**Aktiv:**
```
bg-primary
text-primary-foreground
rounded-xl
```

### Icon-Grosse in Navigation
```
h-5 w-5 (20px)
```

---

## 12. Animationen & Transitions

### Standard-Transition
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Tailwind-Klassen
```
transition-colors duration-200
transition-all duration-300
```

### Keyframe-Animationen

**Fade In:**
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Slide In:**
```css
@keyframes slide-in {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

---

## 13. Interaktive Zustande

### Hover
- Cards: `hover:bg-card/80 hover:shadow-lg`
- Buttons: Varianten-spezifische Anderungen
- Links: `hover:underline`

### Focus
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

### Disabled
```css
opacity: 50%
pointer-events: none
cursor: not-allowed
```

### Loading (Skeleton)
```
h-[hohe] rounded-md bg-muted animate-pulse
```

---

## 14. Responsive Breakpoints

| Breakpoint | Minimum Width | Verwendung |
|------------|--------------|------------|
| sm | 640px | Mobile Landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large Desktop |
| 2xl | 1536px | Extra Large |

### Typische Patterns
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
hidden md:block
text-sm md:text-base
```

---

## 15. Icons

**Icon-Bibliothek:** Lucide React (v0.562.0)

### Icon-Grossen

| Grosse | Klassen | Verwendung |
|--------|---------|------------|
| Small | `h-4 w-4` | Inline, Buttons |
| Default | `h-5 w-5` | Navigation, Standard |
| Large | `h-6 w-6` | Headers, Hervorhebungen |
| XL | `h-10 w-10` | Stat-Cards, Features |

### Icon-Styling in Stat-Cards
```jsx
<div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
  <Icon className="h-5 w-5 text-blue-500" />
</div>
```

---

## 16. Gradienten

### Vordefinierte Gradienten

**Light Gradient:**
```css
linear-gradient(135deg, hsl(0 0% 100% / 0.5), hsl(0 0% 100% / 0.3))
```

**Glass Gradient:**
```css
linear-gradient(135deg, hsl(0 0% 100% / 0.4), hsl(0 0% 100% / 0.2))
```

**Orange Gradient (Primary):**
```css
linear-gradient(135deg, hsl(23 87% 55%), hsl(23 87% 45%))
```

---

## 17. Chart-Farben

Fur Datenvisualisierung und Diagramme:

| Chart | HSL | Verwendung |
|-------|-----|------------|
| Chart 1 | `hsl(24, 95%, 53%)` | Primarwerte |
| Chart 2 | `hsl(217, 91%, 60%)` | Sekundarwerte |
| Chart 3 | `hsl(160, 84%, 39%)` | Tertiarwerte |
| Chart 4 | `hsl(43, 96%, 56%)` | Quartarwerte |
| Chart 5 | `hsl(23, 87%, 55%)` | Primary Accent |

---

## 18. CSS-Variablen Referenz

Alle Farben als CSS-Variablen in `src/index.css`:

### Light Theme (:root)
```css
:root {
  /* Hintergrunde */
  --background: 0 0% 98%;
  --background-secondary: 0 0% 95%;
  --foreground: 0 0% 10%;

  /* Glassmorphism */
  --glass: 0 0% 100% / 0.3;
  --glass-border: 0 0% 100% / 0.4;
  --glass-hover: 0 0% 100% / 0.45;

  /* Primary (Prometheus Orange) */
  --primary: 23 87% 55%;
  --primary-glow: 23 87% 65%;
  --primary-foreground: 0 0% 100%;

  /* Secondary */
  --secondary: 0 0% 92%;
  --secondary-foreground: 0 0% 20%;

  /* Muted */
  --muted: 0 0% 90%;
  --muted-foreground: 0 0% 45%;

  /* Accent */
  --accent: 23 87% 55%;
  --accent-foreground: 0 0% 100%;

  /* UI-Elemente */
  --card: 0 0% 100% / 0.35;
  --card-foreground: 0 0% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 10%;
  --border: 0 0% 0% / 0.08;
  --input: 0 0% 0% / 0.08;
  --ring: 23 87% 55%;

  /* Status */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --success: 142 76% 36%;
  --success-foreground: 0 0% 100%;
  --warning: 45 100% 51%;
  --warning-foreground: 0 0% 10%;
  --info: 207 90% 54%;
  --info-foreground: 0 0% 100%;

  /* Effekte */
  --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  --glow-orange: 0 0 30px hsl(23 87% 55% / 0.3);
  --glow-soft: 0 4px 20px rgba(0, 0, 0, 0.05);

  /* Sonstiges */
  --radius: 1.5rem;
  --primary-rgb: 242, 121, 53;
}
```

### Dark Theme (.dark)
```css
.dark {
  /* Hintergrunde */
  --background: 0 0% 8%;
  --background-secondary: 0 0% 12%;
  --foreground: 0 0% 98%;

  /* Glassmorphism (angepasst fur dunkle Oberflachen) */
  --glass: 0 0% 20% / 0.4;
  --glass-border: 0 0% 100% / 0.1;
  --glass-hover: 0 0% 25% / 0.5;

  /* Primary (bleibt gleich) */
  --primary: 23 87% 55%;
  --primary-glow: 23 87% 65%;
  --primary-foreground: 0 0% 100%;

  /* Secondary (angepasst) */
  --secondary: 0 0% 18%;
  --secondary-foreground: 0 0% 90%;

  /* Muted (angepasst) */
  --muted: 0 0% 20%;
  --muted-foreground: 0 0% 60%;

  /* Accent (bleibt gleich) */
  --accent: 23 87% 55%;
  --accent-foreground: 0 0% 100%;

  /* UI-Elemente (angepasst) */
  --card: 0 0% 15% / 0.4;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 10%;
  --popover-foreground: 0 0% 98%;
  --border: 0 0% 100% / 0.12;
  --input: 0 0% 100% / 0.12;
  --ring: 23 87% 55%;

  /* Status (bleiben gleich) */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --success: 142 76% 36%;
  --success-foreground: 0 0% 100%;
  --warning: 45 100% 51%;
  --warning-foreground: 0 0% 10%;
  --info: 207 90% 54%;
  --info-foreground: 0 0% 100%;

  /* Effekte (intensiver fur Dark Mode) */
  --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  --glow-orange: 0 0 30px hsl(23 87% 55% / 0.4);
  --glow-soft: 0 4px 20px rgba(0, 0, 0, 0.3);
}
```

### Unterschiede Light vs. Dark Mode

| Variable | Light Theme | Dark Theme | Anmerkung |
|----------|-------------|------------|-----------|
| `--background` | 98% Helligkeit | 8% Helligkeit | Invertiert |
| `--foreground` | 10% (fast schwarz) | 98% (fast weiss) | Invertiert |
| `--glass` | Weiss 30% Opazitat | Grau 40% Opazitat | Angepasst |
| `--glass-border` | Weiss 40% | Weiss 10% | Subtiler im Dark |
| `--card` | Weiss 35% | Dunkelgrau 40% | Angepasst |
| `--border` | Schwarz 8% | Weiss 12% | Invertiert |
| `--muted` | 90% Hell | 20% Dunkel | Invertiert |
| `--shadow-glass` | 10% Opazitat | 40% Opazitat | Starker im Dark |
| `--glow-orange` | 30% Opazitat | 40% Opazitat | Intensiver im Dark |

---

## 19. Technologie-Stack

| Technologie | Version | Zweck |
|-------------|---------|-------|
| React | 19.x | UI Framework |
| TypeScript | - | Type Safety |
| Vite | - | Build Tool |
| Tailwind CSS | 3.x | Styling |
| Radix UI | - | Headless Components |
| Lucide React | 0.562.0 | Icons |
| next-themes | 0.4.6 | Theme Switching |

---

## 20. Dateistruktur

```
src/
├── assets/
│   ├── gradient-bg.jpg      # Light Theme Background
│   └── gradient-bg-dark.png # Dark Theme Background
├── components/
│   ├── ui/
│   │   ├── button.tsx       # Button Komponente
│   │   ├── card.tsx         # Card Komponente
│   │   └── input.tsx        # Input Komponente
│   └── layout/
│       ├── AppShell.tsx     # Haupt-Layout
│       ├── Sidebar.tsx      # Navigation
│       └── Header.tsx       # Kopfzeile
├── index.css                # Design System Definitionen
└── tailwind.config.ts       # Tailwind Konfiguration
```

---

*Zuletzt aktualisiert: Januar 2026*
*Version: 1.0*
