"use server";

import { revalidatePath } from "next/cache";
import { recordOrderAction, type OrderAction } from "@/lib/operations-repository";

export async function updateOrderAction(orderId: string, action: OrderAction) {
  const result = await recordOrderAction(orderId, action);

  revalidatePath("/app");
  revalidatePath("/app/orders");
  revalidatePath("/app/orders/packing");

  return result;
}
