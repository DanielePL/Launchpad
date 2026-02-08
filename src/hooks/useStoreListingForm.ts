import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAppProject,
  useUpdateAppProject,
  useProjectChecklist,
  useToggleChecklistItem,
} from "@/hooks/useAppLaunch";
import type { ChecklistItem } from "@/api/types/appLaunch";

// Maps form field names → checklist item_key values
const FIELD_TO_CHECKLIST_KEY: Record<string, string> = {
  name: "app_title",
  short_description: "short_description",
  full_description: "full_description",
  keywords: "keywords",
  app_category: "category",
  content_rating: "content_rating",
};

export type StoreListingFieldName = keyof typeof FIELD_TO_CHECKLIST_KEY;

export interface StoreListingFormData {
  name: string;
  short_description: string;
  full_description: string;
  keywords: string;
  app_category: string;
  content_rating: string;
}

export type FieldStatus = "empty" | "filled" | "saving";

export function useStoreListingForm(projectId: string) {
  const { data: project } = useAppProject(projectId);
  const { data: checklist } = useProjectChecklist(projectId);
  const updateProject = useUpdateAppProject();
  const toggleItem = useToggleChecklistItem();

  const [formData, setFormData] = useState<StoreListingFormData>({
    name: "",
    short_description: "",
    full_description: "",
    keywords: "",
    app_category: "",
    content_rating: "",
  });

  const [savingField, setSavingField] = useState<string | null>(null);

  // Sync form data when project loads
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        short_description: project.short_description || "",
        full_description: project.full_description || "",
        keywords: project.keywords || "",
        app_category: project.app_category || "",
        content_rating: project.content_rating || "",
      });
    }
  }, [project]);

  // Build a map: item_key → ChecklistItem for store_listing items
  const checklistMap = useMemo(() => {
    const map = new Map<string, ChecklistItem>();
    if (checklist) {
      for (const item of checklist) {
        if (item.category === "store_listing") {
          map.set(item.item_key, item);
        }
      }
    }
    return map;
  }, [checklist]);

  const saveField = useCallback(
    async (fieldName: StoreListingFieldName, value: string) => {
      setSavingField(fieldName);

      try {
        // 1. Save the value to app_projects
        await updateProject.mutateAsync({
          id: projectId,
          input: { [fieldName]: value },
        });

        // 2. Find the matching checklist item
        const checklistKey = FIELD_TO_CHECKLIST_KEY[fieldName];
        const checklistItem = checklistMap.get(checklistKey);

        if (checklistItem) {
          const hasValue = value.trim().length > 0;
          // Only toggle if the state needs to change
          if (hasValue && !checklistItem.is_completed) {
            await toggleItem.mutateAsync({
              itemId: checklistItem.id,
              completed: true,
            });
          } else if (!hasValue && checklistItem.is_completed) {
            await toggleItem.mutateAsync({
              itemId: checklistItem.id,
              completed: false,
            });
          }
        }
      } finally {
        setSavingField(null);
      }
    },
    [projectId, updateProject, toggleItem, checklistMap]
  );

  const getFieldStatus = useCallback(
    (fieldName: StoreListingFieldName): FieldStatus => {
      if (savingField === fieldName) return "saving";
      const checklistKey = FIELD_TO_CHECKLIST_KEY[fieldName];
      const checklistItem = checklistMap.get(checklistKey);
      if (checklistItem?.is_completed) return "filled";
      return "empty";
    },
    [savingField, checklistMap]
  );

  return {
    formData,
    setFormData,
    saveField,
    getFieldStatus,
    isSaving: savingField !== null,
    savingField,
  };
}
