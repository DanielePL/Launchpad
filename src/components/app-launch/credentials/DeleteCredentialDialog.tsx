import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentialName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteCredentialDialog({
  open,
  onOpenChange,
  credentialName,
  onConfirm,
  isDeleting,
}: DeleteCredentialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Credential löschen
          </DialogTitle>
          <DialogDescription>
            Möchtest du <strong>{credentialName}</strong> wirklich löschen?
            Diese Aktion kann nicht rückgängig gemacht werden. Verbundene
            Dienste verlieren den Zugriff.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Wird gelöscht..." : "Löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
