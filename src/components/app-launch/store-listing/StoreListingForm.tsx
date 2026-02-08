import { Apple, Play } from "lucide-react";
import { useStoreListingForm } from "@/hooks/useStoreListingForm";
import { StoreListingField } from "./StoreListingField";
import { CategorySelect } from "./CategorySelect";
import type { Platform } from "@/api/types/appLaunch";

interface StoreListingFormProps {
  projectId: string;
  platforms: Platform[];
}

const CONTENT_RATINGS = [
  { value: "everyone", label: "Everyone / 4+" },
  { value: "teen", label: "Teen / 12+" },
  { value: "mature", label: "Mature / 17+" },
];

export function StoreListingForm({ projectId, platforms }: StoreListingFormProps) {
  const { formData, setFormData, saveField, getFieldStatus } =
    useStoreListingForm(projectId);

  const hasIOS = platforms.includes("ios");

  return (
    <div className="space-y-4">
      {/* 1. App Title */}
      <StoreListingField
        label="App-Titel"
        description="Der Name deiner App im Store. Maximal 30 Zeichen."
        status={getFieldStatus("name")}
        onSave={() => saveField("name", formData.name)}
        maxLength={30}
        currentLength={formData.name.length}
      >
        <input
          type="text"
          className="w-full h-10 rounded-lg bg-background/50 border border-white/10 px-3 text-sm"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value.slice(0, 30) }))
          }
          placeholder="z.B. Meine App"
          maxLength={30}
        />
      </StoreListingField>

      {/* 2. Short Description */}
      <StoreListingField
        label="Kurzbeschreibung"
        description="Erscheint als erste Zeile im Store. Maximal 80 Zeichen."
        status={getFieldStatus("short_description")}
        onSave={() => saveField("short_description", formData.short_description)}
        maxLength={80}
        currentLength={formData.short_description.length}
      >
        <input
          type="text"
          className="w-full h-10 rounded-lg bg-background/50 border border-white/10 px-3 text-sm"
          value={formData.short_description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              short_description: e.target.value.slice(0, 80),
            }))
          }
          placeholder="z.B. Die beste App für ..."
          maxLength={80}
        />
      </StoreListingField>

      {/* 3. Full Description */}
      <StoreListingField
        label="Vollständige Beschreibung"
        description="Die ausführliche Store-Beschreibung. Maximal 4000 Zeichen."
        status={getFieldStatus("full_description")}
        onSave={() => saveField("full_description", formData.full_description)}
        maxLength={4000}
        currentLength={formData.full_description.length}
      >
        <textarea
          className="w-full min-h-[160px] rounded-lg bg-background/50 border border-white/10 px-3 py-2 text-sm resize-y"
          value={formData.full_description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              full_description: e.target.value.slice(0, 4000),
            }))
          }
          placeholder="Beschreibe deine App ausführlich..."
          maxLength={4000}
        />
      </StoreListingField>

      {/* 4. Keywords (iOS only) */}
      {hasIOS && (
        <StoreListingField
          label="Keywords"
          description="Kommagetrennte Suchbegriffe für den App Store. Nur für iOS relevant."
          status={getFieldStatus("keywords")}
          onSave={() => saveField("keywords", formData.keywords)}
          platformBadge={
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">
              <Apple className="h-3 w-3" /> iOS
            </span>
          }
        >
          <input
            type="text"
            className="w-full h-10 rounded-lg bg-background/50 border border-white/10 px-3 text-sm"
            value={formData.keywords}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, keywords: e.target.value }))
            }
            placeholder="z.B. fitness, workout, health"
          />
        </StoreListingField>
      )}

      {/* 5. App Category */}
      <StoreListingField
        label="App-Kategorie"
        description="Die Kategorie bestimmt, wo deine App im Store gefunden wird."
        status={getFieldStatus("app_category")}
        onSave={() => saveField("app_category", formData.app_category)}
      >
        <CategorySelect
          platforms={platforms}
          value={formData.app_category}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, app_category: value }))
          }
        />
      </StoreListingField>

      {/* 6. Content Rating */}
      <StoreListingField
        label="Altersfreigabe"
        description="Die Altersfreigabe für deine App in den Stores."
        status={getFieldStatus("content_rating")}
        onSave={() => saveField("content_rating", formData.content_rating)}
      >
        <select
          className="w-full h-10 rounded-lg bg-background/50 border border-white/10 px-3 text-sm"
          value={formData.content_rating}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content_rating: e.target.value }))
          }
        >
          <option value="">Altersfreigabe wählen...</option>
          {CONTENT_RATINGS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </StoreListingField>
    </div>
  );
}
