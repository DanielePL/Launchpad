import { APP_CATEGORIES } from "@/api/types/appLaunch";
import type { Platform } from "@/api/types/appLaunch";

interface CategorySelectProps {
  platforms: Platform[];
  value: string;
  onChange: (value: string) => void;
}

function parseCategoryValue(value: string): { android?: string; ios?: string } {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    // plain string = single-platform value
  }
  return { android: value, ios: value };
}

function serializeCategoryValue(
  platforms: Platform[],
  android?: string,
  ios?: string
): string {
  if (platforms.length === 1) {
    return platforms[0] === "android" ? (android || "") : (ios || "");
  }
  return JSON.stringify({ android: android || "", ios: ios || "" });
}

export function CategorySelect({ platforms, value, onChange }: CategorySelectProps) {
  const parsed = parseCategoryValue(value);
  const isDualPlatform = platforms.includes("android") && platforms.includes("ios");

  if (isDualPlatform) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Android</label>
          <select
            className="w-full h-10 rounded-lg bg-background/50 border border-white/10 px-3 text-sm"
            value={parsed.android || ""}
            onChange={(e) =>
              onChange(serializeCategoryValue(platforms, e.target.value, parsed.ios))
            }
          >
            <option value="">Kategorie wählen...</option>
            {APP_CATEGORIES.android.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">iOS</label>
          <select
            className="w-full h-10 rounded-lg bg-background/50 border border-white/10 px-3 text-sm"
            value={parsed.ios || ""}
            onChange={(e) =>
              onChange(serializeCategoryValue(platforms, parsed.android, e.target.value))
            }
          >
            <option value="">Kategorie wählen...</option>
            {APP_CATEGORIES.ios.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  const categories = platforms.includes("ios")
    ? APP_CATEGORIES.ios
    : APP_CATEGORIES.android;

  return (
    <select
      className="w-full h-10 rounded-lg bg-background/50 border border-white/10 px-3 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Kategorie wählen...</option>
      {categories.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
}
