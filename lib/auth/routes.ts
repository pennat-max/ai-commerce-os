import type { UserRole } from "@/types/domain";

export function getHomePathForRole(role: UserRole) {
  return role === "SUPER_ADMIN" ? "/admin" : "/app";
}

export function isProtectedPath(pathname: string) {
  return pathname.startsWith("/app") || pathname.startsWith("/admin");
}

export function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin");
}

export function isSellerPath(pathname: string) {
  return pathname.startsWith("/app");
}
