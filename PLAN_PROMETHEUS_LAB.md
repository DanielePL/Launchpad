# Prometheus Lab - Implementation Plan

## Ziel
Analytics-Dashboard für Basil Achermann (PhD Sport Science) zur Auswertung aller VBT-Daten aus der Prometheus App.

---

## Datenquellen (Remote Supabase)

| Tabelle | Beschreibung |
|---------|--------------|
| `velocity_history` | VBT-Daten pro Set (mean/peak velocity, MPV, load, RPE, velocity_drop, technique_score) |
| `athlete_lvp_profiles` | Load-Velocity Profile pro User/Exercise (slope, intercept, R², MVT, e1RM) |
| `workout_sessions` | Training Sessions (user, coach, duration, mood/energy) |
| `workout_sets` | Sets mit velocity_metrics JSONB |
| `exercises` | Übungskatalog mit vbt_enabled Flag |
| `user_profiles` | User-Infos (name, sport, experience) |

---

## Features

### 1. Lab Dashboard (Übersicht)
- **KPIs:** Anzahl Athleten mit VBT-Daten, Total Velocity Records, Ø Technique Score, Ø MPV
- **Charts:**
  - Velocity Records über Zeit (Area Chart)
  - Top Exercises nach VBT-Nutzung (Bar Chart)
  - Velocity Distribution (Histogram)
- **Recent Activity:** Letzte VBT-Sessions

### 2. Athletes List
- Tabelle aller User mit VBT-Daten
- Spalten: Name, Sessions, Sets, Exercises tracked, Last Activity, Avg Technique Score
- Filter: Sport, Experience Level, Date Range
- Click → Athlete Detail

### 3. Athlete Detail View
- **Profile Card:** Name, Sport, Experience, Total Sessions/Sets
- **LVP Profiles:** Liste aller Übungen mit e1RM, R², Data Points
- **Load-Velocity Chart:** Interaktiver Scatter Plot mit Regression Line
- **Velocity Trends:** Mean/Peak Velocity über Zeit pro Übung
- **Session History:** Liste aller Sessions mit Velocity-Daten

### 4. Exercise Analysis
- Vergleich mehrerer Athleten auf derselben Übung
- Population Averages (Ø Velocity bei Load X)
- LVP Comparison Chart (mehrere Regressionslinien)
- Velocity Zones Visualization

### 5. Data Export
- CSV Export für alle Velocity Records
- Filter: Athlete, Exercise, Date Range
- Felder: user_id, exercise, load_kg, mean_velocity, peak_velocity, mpv, rpe, technique_score, recorded_at

---

## Technische Umsetzung

### Neue Dateien

```
src/
├── pages/
│   └── lab/
│       ├── LabDashboardPage.tsx      # Haupt-Dashboard
│       ├── AthletesListPage.tsx      # Athleten-Übersicht
│       ├── AthleteDetailPage.tsx     # Einzelner Athlet
│       └── ExerciseAnalysisPage.tsx  # Übungsvergleich
├── api/
│   ├── endpoints/
│   │   └── lab.ts                    # Supabase Queries
│   └── types/
│       └── lab.ts                    # TypeScript Types
├── hooks/
│   └── useLab.ts                     # React Query Hooks
└── components/
    └── lab/
        ├── VelocityChart.tsx         # Load-Velocity Scatter
        ├── LvpProfileCard.tsx        # LVP Profile Display
        ├── AthleteCard.tsx           # Athlete Summary Card
        └── VelocityTrendChart.tsx    # Velocity over Time
```

### Routes (src/routes/index.tsx)
```tsx
{
  path: "lab",
  children: [
    { index: true, element: <LabDashboardPage /> },
    { path: "athletes", element: <AthletesListPage /> },
    { path: "athletes/:userId", element: <AthleteDetailPage /> },
    { path: "exercises", element: <ExerciseAnalysisPage /> },
  ]
}
```

### Sidebar Navigation (src/components/layout/Sidebar.tsx)
```tsx
{
  label: "Prometheus Lab",
  icon: FlaskConical,  // oder Microscope
  href: "/lab",
  permission: "lab:read",  // oder superAdminOnly: true
  children: [
    { label: "Dashboard", href: "/lab" },
    { label: "Athletes", href: "/lab/athletes" },
    { label: "Exercises", href: "/lab/exercises" },
  ]
}
```

### API Queries (src/api/endpoints/lab.ts)

```typescript
// Dashboard Stats
const getLabStats = async () => {
  const { data } = await supabase.rpc('get_lab_stats');
  // oder: aggregate queries auf velocity_history
};

// Athletes with VBT data
const getAthletes = async () => {
  const { data } = await supabase
    .from('velocity_history')
    .select('user_id, user_profiles(name, primary_sport)')
    .order('recorded_at', { ascending: false });
  // Group by user_id, count records
};

// Athlete LVP Profiles
const getAthleteLvpProfiles = async (userId: string) => {
  const { data } = await supabase
    .from('athlete_lvp_profiles')
    .select('*, exercises(name)')
    .eq('user_id', userId);
};

// Velocity History for Athlete/Exercise
const getVelocityHistory = async (userId: string, exerciseId?: string) => {
  let query = supabase
    .from('velocity_history')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false });

  if (exerciseId) query = query.eq('exercise_id', exerciseId);
  return query;
};

// Export Data
const exportVelocityData = async (filters) => {
  // Return CSV-ready data
};
```

---

## TypeScript Types (src/api/types/lab.ts)

```typescript
export interface VelocityRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  load_kg: number;
  peak_velocity: number | null;
  mean_velocity: number | null;
  mpv: number | null;
  set_type: 'warmup' | 'working' | 'topset' | 'backoff';
  set_number: number | null;
  reps: number | null;
  rpe: number | null;
  velocity_drop: number | null;
  technique_score: number | null;
  session_id: string | null;
  load_percent_1rm: number | null;
  recorded_at: string;
}

export interface AthleteLvpProfile {
  id: string;
  user_id: string;
  exercise_id: string;
  sport_type: string;
  velocity_metric: 'mpv' | 'mean_velocity' | 'peak_velocity';
  slope: number | null;
  y_intercept: number | null;
  r_squared: number | null;
  mvt: number;
  estimated_1rm: number | null;
  velocity_by_load: Record<string, number>;
  data_points: number;
  warmup_data_points: number;
  last_updated: string;
}

export interface LabAthlete {
  user_id: string;
  name: string;
  primary_sport: string | null;
  total_sessions: number;
  total_sets: number;
  exercises_tracked: number;
  avg_technique_score: number | null;
  last_activity: string;
}

export interface LabStats {
  total_athletes: number;
  total_velocity_records: number;
  total_sessions: number;
  avg_technique_score: number;
  avg_mpv: number;
}
```

---

## Reihenfolge der Implementierung

1. **Types & API Setup** - Types definieren, Supabase Queries
2. **Lab Dashboard** - Haupt-Dashboard mit Stats und Charts
3. **Athletes List** - Tabelle mit allen Athleten
4. **Athlete Detail** - LVP Profile, Velocity Charts
5. **Exercise Analysis** - Athleten-Vergleich (optional, Phase 2)
6. **CSV Export** - Daten-Export für Basil

---

## Fragen / Entscheidungen

1. **Zugriffskontrolle:** Soll das Lab nur für Super Admins sichtbar sein, oder braucht es eine eigene `lab:read` Permission?
2. **RPC Functions:** Sollen wir Supabase RPC Functions für komplexe Aggregationen erstellen, oder client-side berechnen?
3. **Echtzeit:** Braucht es Realtime-Updates wenn neue VBT-Daten reinkommen?

---

## Geschätzter Scope

- Dashboard + Athletes List + Athlete Detail = Kern-Features
- Exercise Analysis + Export = Nice-to-have Phase 2
