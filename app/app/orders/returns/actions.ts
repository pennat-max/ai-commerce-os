"use server";

import { revalidatePath } from "next/cache";
import {
  createClaimCase,
  createReturnCase,
  updateClaimCase,
  updateReturnCase,
  type CreateClaimCaseInput,
  type CreateReturnCaseInput,
  type UpdateClaimCaseInput,
  type UpdateReturnCaseInput,
} from "@/lib/operations-repository";

function revalidateReturns() {
  revalidatePath("/app");
  revalidatePath("/app/orders");
  revalidatePath("/app/orders/returns");
}

export async function createReturnCaseAction(input: CreateReturnCaseInput) {
  const result = await createReturnCase(input);
  revalidateReturns();
  return result;
}

export async function updateReturnCaseAction(id: string, input: UpdateReturnCaseInput) {
  const result = await updateReturnCase(id, input);
  revalidateReturns();
  return result;
}

export async function createClaimCaseAction(input: CreateClaimCaseInput) {
  const result = await createClaimCase(input);
  revalidateReturns();
  return result;
}

export async function updateClaimCaseAction(id: string, input: UpdateClaimCaseInput) {
  const result = await updateClaimCase(id, input);
  revalidateReturns();
  return result;
}
