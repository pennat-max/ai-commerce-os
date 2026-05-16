import type { UserRole } from "@/types/domain";

export type AppSession = {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string | null;
  organizationName: string | null;
};
