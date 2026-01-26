import { useState, useEffect } from "react";
import {
  Megaphone,
  Search,
  Plus,
  Users,
  CheckCircle2,
  Package,
  Clock,
  X,
  Trash2,
  ExternalLink,
  Video,
  Camera,
  Film,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAmbassadors,
  useAmbassadorStats,
  useCreateAmbassador,
  useUpdateAmbassador,
  useDeleteAmbassador,
  useDeliverables,
  useCreateDeliverable,
  useUpdateDeliverable,
  useDeleteDeliverable,
} from "@/hooks/useAmbassadors";
import type {
  Ambassador,
  AmbassadorCreate,
  AmbassadorStatus,
  AmbassadorDeliverable,
  DeliverableCreate,
  ContentType,
  DeliverableStatus,
} from "@/api/types";
import {
  AMBASSADOR_STATUS_CONFIG,
  DELIVERABLE_STATUS_CONFIG,
  CONTENT_TYPE_CONFIG,
  SPORT_OPTIONS,
} from "@/api/types";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// =====================================================
// Content Type Icons
// =====================================================

const contentTypeIcons: Record<ContentType, typeof Video> = {
  video: Video,
  photo: Camera,
  story: CircleDot,
  reel: Film,
};

// =====================================================
// Filter Tab Type
// =====================================================

type FilterTab = "all" | "active" | "onboarding" | "paused";

// =====================================================
// Add Ambassador Modal
// =====================================================

interface AddAmbassadorModalProps {
  open: boolean;
  onClose: () => void;
}

function AddAmbassadorModal({ open, onClose }: AddAmbassadorModalProps) {
  const createAmbassador = useCreateAmbassador();
  const [form, setForm] = useState<AmbassadorCreate>({
    name: "",
    email: "",
    phone: "",
    tiktok_handle: "",
    instagram_handle: "",
    youtube_handle: "",
    sport: "",
    status: "contacted",
    notes: "",
    profile_photo_url: "",
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }

    // Clean up empty strings to undefined
    const cleaned: AmbassadorCreate = {
      name: form.name,
      email: form.email,
      ...(form.phone ? { phone: form.phone } : {}),
      ...(form.tiktok_handle ? { tiktok_handle: form.tiktok_handle } : {}),
      ...(form.instagram_handle ? { instagram_handle: form.instagram_handle } : {}),
      ...(form.youtube_handle ? { youtube_handle: form.youtube_handle } : {}),
      ...(form.sport ? { sport: form.sport } : {}),
      ...(form.status ? { status: form.status } : {}),
      ...(form.notes ? { notes: form.notes } : {}),
      ...(form.profile_photo_url ? { profile_photo_url: form.profile_photo_url } : {}),
    };

    createAmbassador.mutate(cleaned, {
      onSuccess: () => {
        toast.success("Ambassador added");
        onClose();
        setForm({ name: "", email: "" });
      },
      onError: () => toast.error("Failed to add ambassador"),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Add Ambassador</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 234 567 890"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sport</label>
              <select
                value={form.sport || ""}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-input text-sm"
              >
                <option value="">Select sport...</option>
                {SPORT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">TikTok</label>
              <Input
                value={form.tiktok_handle || ""}
                onChange={(e) => setForm({ ...form, tiktok_handle: e.target.value })}
                placeholder="@handle"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instagram</label>
              <Input
                value={form.instagram_handle || ""}
                onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })}
                placeholder="@handle"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube</label>
              <Input
                value={form.youtube_handle || ""}
                onChange={(e) => setForm({ ...form, youtube_handle: e.target.value })}
                placeholder="@channel"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status || "contacted"}
              onChange={(e) => setForm({ ...form, status: e.target.value as AmbassadorStatus })}
              className="w-full h-10 px-3 rounded-xl bg-background border border-input text-sm"
            >
              {Object.entries(AMBASSADOR_STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Photo URL</label>
            <Input
              value={form.profile_photo_url || ""}
              onChange={(e) => setForm({ ...form, profile_photo_url: e.target.value })}
              placeholder="https://..."
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes..."
              className="w-full min-h-20 px-3 py-2 rounded-xl bg-background border border-input text-sm resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={createAmbassador.isPending}>
              {createAmbassador.isPending ? "Adding..." : "Add Ambassador"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// Ambassador Detail Modal
// =====================================================

interface AmbassadorDetailModalProps {
  ambassador: Ambassador | null;
  onClose: () => void;
}

function AmbassadorDetailModal({ ambassador, onClose }: AmbassadorDetailModalProps) {
  const updateAmbassador = useUpdateAmbassador();
  const deleteAmbassadorMut = useDeleteAmbassador();
  const { data: deliverables, isLoading: deliverablesLoading } = useDeliverables(ambassador?.id || null);
  const createDeliverable = useCreateDeliverable();
  const updateDeliverableMut = useUpdateDeliverable(ambassador?.id || null);
  const deleteDeliverableMut = useDeleteDeliverable(ambassador?.id || null);

  const [notes, setNotes] = useState(ambassador?.notes || "");
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [deliverableForm, setDeliverableForm] = useState<Omit<DeliverableCreate, "ambassador_id">>({
    content_type: "video",
    title: "",
    description: "",
    delivery_date: "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync notes when ambassador changes
  useEffect(() => {
    setNotes(ambassador?.notes || "");
  }, [ambassador?.notes]);

  if (!ambassador) return null;

  const statusConfig = AMBASSADOR_STATUS_CONFIG[ambassador.status];

  const handleStatusChange = (newStatus: AmbassadorStatus) => {
    updateAmbassador.mutate(
      { id: ambassador.id, update: { status: newStatus } },
      {
        onSuccess: () => toast.success(`Status changed to ${AMBASSADOR_STATUS_CONFIG[newStatus].label}`),
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  const handleSaveNotes = () => {
    updateAmbassador.mutate(
      { id: ambassador.id, update: { notes } },
      {
        onSuccess: () => toast.success("Notes saved"),
        onError: () => toast.error("Failed to save notes"),
      }
    );
  };

  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableForm.title) {
      toast.error("Title is required");
      return;
    }

    createDeliverable.mutate(
      {
        ambassador_id: ambassador.id,
        content_type: deliverableForm.content_type,
        title: deliverableForm.title,
        ...(deliverableForm.description ? { description: deliverableForm.description } : {}),
        ...(deliverableForm.delivery_date ? { delivery_date: deliverableForm.delivery_date } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Deliverable added");
          setShowAddDeliverable(false);
          setDeliverableForm({ content_type: "video", title: "", description: "", delivery_date: "" });
        },
        onError: () => toast.error("Failed to add deliverable"),
      }
    );
  };

  const handleDeliverableStatusChange = (delivId: string, status: DeliverableStatus) => {
    updateDeliverableMut.mutate(
      { id: delivId, update: { status } },
      {
        onSuccess: () => toast.success("Deliverable status updated"),
        onError: () => toast.error("Failed to update deliverable"),
      }
    );
  };

  const handleDeleteDeliverable = (delivId: string) => {
    deleteDeliverableMut.mutate(delivId, {
      onSuccess: () => toast.success("Deliverable deleted"),
      onError: () => toast.error("Failed to delete deliverable"),
    });
  };

  const handleDeleteAmbassador = () => {
    deleteAmbassadorMut.mutate(ambassador.id, {
      onSuccess: () => {
        toast.success("Ambassador deleted");
        onClose();
      },
      onError: () => toast.error("Failed to delete ambassador"),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {ambassador.profile_photo_url ? (
              <img
                src={ambassador.profile_photo_url}
                alt={ambassador.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                {ambassador.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{ambassador.name}</h2>
              <p className="text-sm text-muted-foreground">{ambassador.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Info */}
          <div className="grid gap-3 md:grid-cols-2 text-sm">
            {ambassador.phone && (
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <span className="font-medium">{ambassador.phone}</span>
              </div>
            )}
            {ambassador.sport && (
              <div>
                <span className="text-muted-foreground">Sport: </span>
                <span className="font-medium">{ambassador.sport}</span>
              </div>
            )}
            {ambassador.tiktok_handle && (
              <div>
                <span className="text-muted-foreground">TikTok: </span>
                <span className="font-medium">{ambassador.tiktok_handle}</span>
              </div>
            )}
            {ambassador.instagram_handle && (
              <div>
                <span className="text-muted-foreground">Instagram: </span>
                <span className="font-medium">{ambassador.instagram_handle}</span>
              </div>
            )}
            {ambassador.youtube_handle && (
              <div>
                <span className="text-muted-foreground">YouTube: </span>
                <span className="font-medium">{ambassador.youtube_handle}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Added: </span>
              <span className="font-medium">{format(parseISO(ambassador.created_at), "MMM d, yyyy")}</span>
            </div>
          </div>

          {/* Status Buttons */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(AMBASSADOR_STATUS_CONFIG) as [AmbassadorStatus, typeof statusConfig][]).map(
                ([key, cfg]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={ambassador.status === key ? "default" : "outline"}
                    onClick={() => handleStatusChange(key)}
                    className="rounded-xl text-xs"
                    disabled={updateAmbassador.isPending}
                  >
                    {cfg.label}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this ambassador..."
              className="w-full min-h-24 px-3 py-2 rounded-xl bg-background border border-input text-sm resize-y"
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={notes === (ambassador.notes || "") || updateAmbassador.isPending}
                className="rounded-xl"
              >
                Save Notes
              </Button>
            </div>
          </div>

          {/* Deliverables Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Deliverables</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddDeliverable(!showAddDeliverable)}
                className="rounded-xl text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Deliverable
              </Button>
            </div>

            {/* Add Deliverable Form */}
            {showAddDeliverable && (
              <form onSubmit={handleAddDeliverable} className="glass rounded-xl p-4 mb-4 space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Title *</label>
                    <Input
                      value={deliverableForm.title}
                      onChange={(e) => setDeliverableForm({ ...deliverableForm, title: e.target.value })}
                      placeholder="Deliverable title"
                      className="rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Content Type</label>
                    <select
                      value={deliverableForm.content_type}
                      onChange={(e) => setDeliverableForm({ ...deliverableForm, content_type: e.target.value as ContentType })}
                      className="w-full h-10 px-3 rounded-xl bg-background border border-input text-sm"
                    >
                      {Object.entries(CONTENT_TYPE_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Description</label>
                  <Input
                    value={deliverableForm.description || ""}
                    onChange={(e) => setDeliverableForm({ ...deliverableForm, description: e.target.value })}
                    placeholder="Brief description"
                    className="rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={deliverableForm.delivery_date || ""}
                    onChange={(e) => setDeliverableForm({ ...deliverableForm, delivery_date: e.target.value })}
                    className="rounded-xl text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddDeliverable(false)} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="rounded-xl text-xs" disabled={createDeliverable.isPending}>
                    {createDeliverable.isPending ? "Adding..." : "Add"}
                  </Button>
                </div>
              </form>
            )}

            {/* Deliverables List */}
            {deliverablesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : deliverables && deliverables.length > 0 ? (
              <div className="space-y-2">
                {deliverables.map((d: AmbassadorDeliverable) => {
                  const TypeIcon = contentTypeIcons[d.content_type];
                  const dStatusCfg = DELIVERABLE_STATUS_CONFIG[d.status];
                  const typeCfg = CONTENT_TYPE_CONFIG[d.content_type];

                  return (
                    <div key={d.id} className="glass rounded-xl p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-lg ${dStatusCfg.bg} ${dStatusCfg.color} flex items-center justify-center flex-shrink-0`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{d.title}</p>
                              <span className="text-xs text-muted-foreground">{typeCfg.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {d.delivery_date && (
                                <span>Due: {format(parseISO(d.delivery_date), "MMM d, yyyy")}</span>
                              )}
                              {d.delivered_at && (
                                <span>Delivered: {format(parseISO(d.delivered_at), "MMM d, yyyy")}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {d.content_url && (
                            <a
                              href={d.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <select
                            value={d.status}
                            onChange={(e) => handleDeliverableStatusChange(d.id, e.target.value as DeliverableStatus)}
                            className={`h-7 px-2 rounded-lg text-xs font-medium border-0 ${dStatusCfg.bg} ${dStatusCfg.color}`}
                          >
                            {Object.entries(DELIVERABLE_STATUS_CONFIG).map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}</option>
                            ))}
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteDeliverable(d.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No deliverables yet. Click "Add Deliverable" to create one.
              </div>
            )}
          </div>

          {/* Delete Ambassador */}
          <div className="pt-4 border-t border-white/10">
            {!confirmDelete ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="rounded-xl text-xs text-destructive border-destructive/50 hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete Ambassador
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-destructive">Are you sure?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteAmbassador}
                  className="rounded-xl text-xs"
                  disabled={deleteAmbassadorMut.isPending}
                >
                  {deleteAmbassadorMut.isPending ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Main Page Component
// =====================================================

export function AmbassadorControlPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null);

  // Build filters from tab
  const filters = activeTab !== "all" ? { status: activeTab as AmbassadorStatus } : undefined;

  const { data: ambassadors, isLoading } = useAmbassadors(filters);
  const { data: stats, isLoading: statsLoading } = useAmbassadorStats();

  // Filter by search locally
  const filteredAmbassadors = ambassadors?.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (a.tiktok_handle?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (a.instagram_handle?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  ) || [];

  // When ambassadors data changes, refresh the selected ambassador if open
  const refreshedSelected = selectedAmbassador
    ? ambassadors?.find((a) => a.id === selectedAmbassador.id) || selectedAmbassador
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Ambassador Control</h1>
          <p className="text-muted-foreground text-lg">Manage content ambassadors and deliverables</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Ambassador
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ambassadors</p>
              {statsLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats?.total ?? 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              {statsLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats?.active ?? 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-500">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered This Month</p>
              {statsLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats?.delivered_this_month ?? 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/20 text-yellow-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Deliverables</p>
              {statsLoading ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-xl font-bold">{stats?.pending ?? 0}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="glass rounded-2xl p-1 inline-flex">
          {(["all", "active", "onboarding", "paused"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, sport, handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Ambassador Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </>
        ) : filteredAmbassadors.length > 0 ? (
          filteredAmbassadors.map((ambassador) => {
            const sCfg = AMBASSADOR_STATUS_CONFIG[ambassador.status];
            return (
              <div
                key={ambassador.id}
                className="glass rounded-2xl p-4 transition-smooth hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] cursor-pointer"
                onClick={() => setSelectedAmbassador(ambassador)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {ambassador.profile_photo_url ? (
                      <img
                        src={ambassador.profile_photo_url}
                        alt={ambassador.name}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
                        {ambassador.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{ambassador.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {ambassador.sport && <span>{ambassador.sport}</span>}
                        {ambassador.instagram_handle && <span>IG: {ambassador.instagram_handle}</span>}
                        {ambassador.tiktok_handle && <span>TT: {ambassador.tiktok_handle}</span>}
                      </div>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${sCfg.bg} ${sCfg.color} flex-shrink-0`}>
                    {sCfg.label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold mb-2">No ambassadors found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Get started by adding your first ambassador"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddModal(true)} className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Ambassador
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddAmbassadorModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <AmbassadorDetailModal
        ambassador={refreshedSelected}
        onClose={() => setSelectedAmbassador(null)}
      />
    </div>
  );
}
