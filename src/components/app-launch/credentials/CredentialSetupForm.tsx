import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CredentialStatusBadge } from "./CredentialStatusBadge";
import {
  useCreateCredential,
  useUpdateCredential,
  useDeleteCredential,
} from "@/hooks/useAppLaunch";
import {
  Save,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Upload,
  FileCheck,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CredentialTypeDefinition,
  StoreCredential,
} from "@/api/types/appLaunch";
import { DeleteCredentialDialog } from "./DeleteCredentialDialog";

interface CredentialSetupFormProps {
  definition: CredentialTypeDefinition;
  existingCredential?: StoreCredential;
}

export function CredentialSetupForm({
  definition,
  existingCredential,
}: CredentialSetupFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [showSteps, setShowSteps] = useState(!existingCredential);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const deleteCredential = useDeleteCredential();

  const isEditing = !!existingCredential;
  const isSaving = createCredential.isPending || updateCredential.isPending;

  const status = existingCredential
    ? existingCredential.is_valid
      ? "configured"
      : "invalid"
    : "missing";

  const hasFormData = definition.fields.some(
    (f) => formData[f.key] && formData[f.key].trim() !== ""
  );

  const allRequiredFilled = definition.fields
    .filter((f) => f.required)
    .every((f) => formData[f.key] && formData[f.key].trim() !== "");

  const handleFileChange = (key: string, file: File | undefined) => {
    if (!file) return;
    setFileNames((prev) => ({ ...prev, [key]: file.name }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFormData((prev) => ({ ...prev, [key]: content }));
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    if (!allRequiredFilled && !isEditing) return;

    if (isEditing) {
      updateCredential.mutate(
        {
          id: existingCredential.id,
          input: { data: formData },
        },
        {
          onSuccess: () => {
            setFormData({});
            setFileNames({});
          },
        }
      );
    } else {
      createCredential.mutate(
        {
          platform: definition.platform,
          credential_type: definition.key,
          name: definition.name,
          data: formData,
        },
        {
          onSuccess: () => {
            setFormData({});
            setFileNames({});
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!existingCredential) return;
    deleteCredential.mutate(existingCredential.id, {
      onSuccess: () => setDeleteOpen(false),
    });
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{definition.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {definition.description}
          </p>
        </div>
        <CredentialStatusBadge status={status} />
      </div>

      {/* Setup Steps */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full p-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showSteps ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Setup-Anleitung ({definition.setupSteps.length} Schritte)
          {definition.docsUrl && (
            <a
              href={definition.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex items-center gap-1 text-primary hover:underline"
            >
              Docs <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </button>

        {showSteps && (
          <div className="px-4 pb-4">
            <ol className="space-y-2">
              {definition.setupSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="border-t border-white/5 p-4 space-y-4">
        {definition.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-1.5">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>

            {field.type === "file" ? (
              <div>
                <input
                  ref={(el) => { fileInputRefs.current[field.key] = el; }}
                  type="file"
                  accept={field.accept}
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(field.key, e.target.files?.[0])
                  }
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRefs.current[field.key]?.click()}
                  className="gap-2 w-full justify-start"
                >
                  {fileNames[field.key] ? (
                    <>
                      <FileCheck className="h-4 w-4 text-green-500" />
                      {fileNames[field.key]}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Datei auswählen ({field.accept})
                    </>
                  )}
                </Button>
              </div>
            ) : field.type === "textarea" ? (
              <Textarea
                value={formData[field.key] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                placeholder={field.placeholder}
                rows={4}
              />
            ) : field.type === "password" ? (
              <div className="relative">
                <Input
                  type={showPasswords[field.key] ? "text" : "password"}
                  value={formData[field.key] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      [field.key]: !prev[field.key],
                    }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showPasswords[field.key] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : (
              <Input
                type="text"
                value={formData[field.key] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                placeholder={field.placeholder}
              />
            )}

            {field.helpText && (
              <p className="text-xs text-muted-foreground mt-1">
                {field.helpText}
              </p>
            )}
          </div>
        ))}

        {/* Actions */}
        <div className={cn("flex gap-2 pt-2", isEditing ? "justify-between" : "justify-end")}>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Löschen
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || (!hasFormData && !isEditing)}
            className="gap-2"
            size="sm"
          >
            <Save className="h-4 w-4" />
            {isSaving
              ? "Wird gespeichert..."
              : isEditing
                ? "Aktualisieren"
                : "Speichern"}
          </Button>
        </div>
      </div>

      {/* Delete Dialog */}
      {existingCredential && (
        <DeleteCredentialDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          credentialName={definition.name}
          onConfirm={handleDelete}
          isDeleting={deleteCredential.isPending}
        />
      )}
    </div>
  );
}
