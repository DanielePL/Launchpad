// =============================================================================
// Activity Log Types
// =============================================================================

export type ActivityAction =
  // Member actions
  | "member.added"
  | "member.removed"
  | "member.role_changed"
  // Invitation actions
  | "invitation.sent"
  | "invitation.revoked"
  | "invitation.accepted"
  // Organization actions
  | "organization.created"
  | "organization.updated"
  | "organization.deleted"
  // Creator actions
  | "creator.created"
  | "creator.updated"
  | "creator.deleted"
  // Task actions
  | "task.created"
  | "task.updated"
  | "task.deleted"
  | "task.completed"
  // Contract actions
  | "contract.created"
  | "contract.updated"
  | "contract.deleted"
  // Deal actions
  | "deal.created"
  | "deal.updated"
  | "deal.deleted"
  // Settings actions
  | "settings.updated"
  | "billing.updated";

export type EntityType =
  | "member"
  | "invitation"
  | "organization"
  | "creator"
  | "task"
  | "contract"
  | "deal"
  | "settings";

export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  user_email: string | null;
  action: ActivityAction;
  entity_type: EntityType;
  entity_id: string | null;
  entity_name: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ActivityLogFilters {
  action?: ActivityAction;
  entity_type?: EntityType;
  user_id?: string;
  days?: number;
  limit?: number;
}

export interface CreateActivityLogInput {
  action: ActivityAction;
  entity_type: EntityType;
  entity_id?: string | null;
  entity_name?: string | null;
  details?: Record<string, unknown>;
}
