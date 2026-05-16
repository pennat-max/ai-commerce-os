import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/session-provider";
import { getAppSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "SUPER_ADMIN") {
    redirect("/app");
  }

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
