import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/session-provider";
import { getAppSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SellerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
