"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAppSession, resolveOrganizationId } from "@/lib/auth/session";
import { dispatchNotification } from "@/lib/notifications/dispatch";
import { enqueueNotification } from "@/lib/notifications/queue";
import {
  createCampaign,
  createProduct,
  markAlertRead,
  updateProductProfitRules,
  type CreateCampaignInput,
  type CreateProductInput,
} from "@/lib/repositories";
import type { AlertChannel } from "@/types/domain";

export async function saveProductProfitRulesAction(
  productId: string,
  minProfit: number,
  minMarginPercent: number,
) {
  const result = await updateProductProfitRules(productId, minProfit, minMarginPercent);
  if (result.ok) {
    revalidatePath("/app/profit-rules");
    revalidatePath("/app/products");
  }
  return result;
}

export async function markAlertReadAction(alertId: string) {
  await markAlertRead(alertId);
  revalidatePath("/app/alerts");
}

export async function sendTestNotificationAction(channel: AlertChannel, title: string, message: string) {
  const session = await getAppSession();
  if (!session) return { ok: false, error: "ไม่ได้เข้าสู่ระบบ" };

  const orgId = resolveOrganizationId(session);
  await enqueueNotification({ channel, title, message, organizationId: orgId });

  const result = await dispatchNotification({ channel, title, message, organizationId: orgId });
  revalidatePath("/app/alerts");
  return result;
}

export async function createProductAction(input: CreateProductInput) {
  const result = await createProduct(input);
  if (result.ok) {
    revalidatePath("/app/products");
    redirect(`/app/products/${result.productId}`);
  }
  return result;
}

export async function createCampaignAction(input: CreateCampaignInput) {
  const result = await createCampaign(input);
  if (result.ok) {
    revalidatePath("/app/campaigns");
    redirect(`/app/campaigns/${result.campaignId}`);
  }
  return result;
}
