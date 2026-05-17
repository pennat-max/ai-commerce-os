"use server";

import { revalidatePath } from "next/cache";
import { markAlertRead, updateProductProfitRules } from "@/lib/repositories";

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
