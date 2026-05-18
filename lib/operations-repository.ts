import { getAppSession, resolveOrganizationId } from "@/lib/auth/session";
import {
  mockOrders,
  mockReturnCases,
  orderPipeline,
  type MockOrder,
  type MockReturnCase,
  type OperationPlatform,
  type OrderPipelineStatus,
  type ReturnCaseStatus,
} from "@/lib/operations-mock";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Platform } from "@/types/domain";

const useSupabaseData =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" && isSupabaseConfigured();

export type OperationsSource = "mock" | "supabase";
export type OrderAction = "print" | "pack" | "ready" | "issue";
export type OperationOrderStatus =
  | "pending_label"
  | "picking"
  | "packing"
  | "ready_to_ship"
  | "carrier_collected"
  | "in_transit"
  | "delivered"
  | "issue"
  | "cancelled";
export type ReturnStatus =
  | "opened"
  | "awaiting_evidence"
  | "in_review"
  | "return_in_transit"
  | "received"
  | "restocked"
  | "refund_pending"
  | "resolved"
  | "rejected";
export type ReturnCaseType = "return" | "refund" | "refused_delivery" | "wrong_item" | "damaged_item";
export type ClaimStatus =
  | "opened"
  | "evidence_needed"
  | "submitted"
  | "approved"
  | "rejected"
  | "paid"
  | "written_off";
export type ClaimCaseType =
  | "carrier_damage"
  | "marketplace_dispute"
  | "wrong_item"
  | "missing_item"
  | "goodwill_compensation";

type OperationPriority = "normal" | "urgent" | "risk";
type OperationEventType =
  | "manual_created"
  | "label_printed"
  | "picking_started"
  | "packing_started"
  | "packing_completed"
  | "ready_to_ship"
  | "issue_reported"
  | "cancelled"
  | "note_added";

type OperationOrderRow = {
  id: string;
  organization_id: string;
  store_id: string | null;
  platform: Platform;
  external_order_id: string | null;
  order_number: string;
  customer_name: string;
  status: OperationOrderStatus;
  priority: OperationPriority;
  paid_at: string | null;
  pack_by: string | null;
  ship_by: string | null;
  carrier: string | null;
  tracking_number: string | null;
  note: string | null;
  created_at: string;
};

type OperationOrderItemRow = {
  id: string;
  organization_id: string;
  order_id: string;
  product_id: string | null;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
};

type ReturnCaseRow = {
  id: string;
  organization_id: string;
  order_id: string | null;
  case_number: string;
  platform: Platform;
  external_case_id: string | null;
  case_type: ReturnCaseType;
  status: ReturnStatus;
  customer_name: string;
  reason: string;
  cost_impact: number;
  evidence_label: string | null;
  suggested_action: string | null;
  opened_at: string;
  due_at: string | null;
  resolved_at: string | null;
  updated_at: string;
};

type ClaimCaseRow = {
  id: string;
  organization_id: string;
  return_case_id: string | null;
  order_id: string | null;
  claim_number: string;
  claim_type: ClaimCaseType;
  status: ClaimStatus;
  carrier: string | null;
  requested_amount: number;
  approved_amount: number;
  evidence_status: string;
  opened_at: string;
  submitted_at: string | null;
  resolved_at: string | null;
  updated_at: string;
};

export type OperationsResult<T> = {
  data: T;
  source: OperationsSource;
  error?: string;
};

export type OrderMutationResult = {
  ok: boolean;
  source: OperationsSource;
  order?: MockOrder;
  error?: string;
};

export type CreateOrderInput = {
  storeId?: string | null;
  platform: Platform;
  externalOrderId?: string | null;
  orderNumber: string;
  customerName: string;
  status?: OperationOrderStatus;
  priority?: OperationPriority;
  paidAt?: string | null;
  packBy?: string | null;
  shipBy?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  note?: string | null;
  items: Array<{
    productId?: string | null;
    sku: string;
    name: string;
    quantity: number;
    unitPrice?: number;
    unitCost?: number;
  }>;
};

export type CreateReturnCaseInput = {
  orderId?: string | null;
  platform: Platform;
  externalCaseId?: string | null;
  caseNumber: string;
  caseType?: ReturnCaseType;
  status?: ReturnStatus;
  customerName: string;
  reason: string;
  costImpact?: number;
  evidenceLabel?: string | null;
  suggestedAction?: string | null;
  dueAt?: string | null;
};

export type UpdateReturnCaseInput = Partial<
  Pick<
    CreateReturnCaseInput,
    "status" | "reason" | "costImpact" | "evidenceLabel" | "suggestedAction" | "dueAt"
  >
> & {
  resolvedAt?: string | null;
};

export type CreateClaimCaseInput = {
  returnCaseId?: string | null;
  orderId?: string | null;
  claimNumber: string;
  claimType: ClaimCaseType;
  status?: ClaimStatus;
  carrier?: string | null;
  requestedAmount?: number;
  approvedAmount?: number;
  evidenceStatus?: string;
};

export type UpdateClaimCaseInput = Partial<
  Pick<CreateClaimCaseInput, "status" | "carrier" | "requestedAmount" | "approvedAmount" | "evidenceStatus">
> & {
  submittedAt?: string | null;
  resolvedAt?: string | null;
};

const platformLabel: Record<Platform, OperationPlatform> = {
  shopee: "Shopee",
  lazada: "Lazada",
  tiktok: "TikTok Shop",
};

const statusToUi: Record<OperationOrderStatus, OrderPipelineStatus> = {
  pending_label: orderPipeline[0],
  picking: orderPipeline[1],
  packing: orderPipeline[2],
  ready_to_ship: orderPipeline[3],
  carrier_collected: orderPipeline[4],
  in_transit: orderPipeline[5],
  delivered: orderPipeline[6],
  issue: orderPipeline[7],
  cancelled: orderPipeline[7],
};

const actionStatus: Record<OrderAction, OperationOrderStatus> = {
  print: "picking",
  pack: "packing",
  ready: "ready_to_ship",
  issue: "issue",
};

const actionEventType: Record<OrderAction, OperationEventType> = {
  print: "label_printed",
  pack: "packing_started",
  ready: "ready_to_ship",
  issue: "issue_reported",
};

const fallbackPriority = mockOrders[0].priority;
const priorityLabel: Record<OperationPriority, MockOrder["priority"]> = {
  urgent: mockOrders[0]?.priority ?? fallbackPriority,
  normal: mockOrders[1]?.priority ?? fallbackPriority,
  risk: mockOrders[2]?.priority ?? fallbackPriority,
};

const carriers: MockOrder["carrier"][] = ["Kerry", "J&T", "Flash", "Thailand Post"];
const fallbackReturnStatus = mockReturnCases[0].status;
const fallbackClaimStatus = mockReturnCases.find((item) => item.caseNumber.startsWith("CLM"))?.status ?? fallbackReturnStatus;
const returnStatusToUi: Record<ReturnStatus, ReturnCaseStatus> = {
  opened: fallbackReturnStatus,
  awaiting_evidence: fallbackReturnStatus,
  in_review: fallbackReturnStatus,
  return_in_transit: mockReturnCases[1]?.status ?? fallbackReturnStatus,
  received: mockReturnCases[3]?.status ?? fallbackReturnStatus,
  restocked: mockReturnCases[4]?.status ?? fallbackReturnStatus,
  refund_pending: mockReturnCases[3]?.status ?? fallbackReturnStatus,
  resolved: mockReturnCases[4]?.status ?? fallbackReturnStatus,
  rejected: mockReturnCases[5]?.status ?? fallbackReturnStatus,
};
const returnTypeToReason: Record<ReturnCaseType, ReturnCaseStatus> = {
  return: mockReturnCases[1]?.reason ?? fallbackReturnStatus,
  refund: mockReturnCases[3]?.reason ?? fallbackReturnStatus,
  refused_delivery: mockReturnCases[1]?.reason ?? fallbackReturnStatus,
  wrong_item: mockReturnCases[0]?.reason ?? fallbackReturnStatus,
  damaged_item: fallbackClaimStatus,
};
const claimStatusToUi: Record<ClaimStatus, ReturnCaseStatus> = {
  opened: fallbackClaimStatus,
  evidence_needed: fallbackClaimStatus,
  submitted: fallbackClaimStatus,
  approved: fallbackClaimStatus,
  rejected: mockReturnCases[5]?.status ?? fallbackClaimStatus,
  paid: mockReturnCases[4]?.status ?? fallbackClaimStatus,
  written_off: mockReturnCases[5]?.status ?? fallbackClaimStatus,
};
const claimTypeToReason: Record<ClaimCaseType, ReturnCaseStatus> = {
  carrier_damage: fallbackClaimStatus,
  marketplace_dispute: fallbackClaimStatus,
  wrong_item: mockReturnCases[0]?.reason ?? fallbackClaimStatus,
  missing_item: fallbackClaimStatus,
  goodwill_compensation: mockReturnCases[3]?.reason ?? fallbackClaimStatus,
};

export const packingStatuses = new Set<OrderPipelineStatus>([
  orderPipeline[0],
  orderPipeline[1],
  orderPipeline[2],
]);

export const packingQueueStatuses = new Set<OrderPipelineStatus>([
  orderPipeline[0],
  orderPipeline[1],
  orderPipeline[2],
  orderPipeline[3],
]);

function scopedMockOrders() {
  return mockOrders;
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function formatOperationTime(value: string | null, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapCarrier(value: string | null): MockOrder["carrier"] {
  return carriers.find((carrier) => carrier === value) ?? "Flash";
}

function mapOrder(row: OperationOrderRow, items: OperationOrderItemRow[]): MockOrder {
  const itemRows = items.filter((item) => item.order_id === row.id);
  const firstItem = itemRows[0];
  const quantity = itemRows.reduce((sum, item) => sum + toNumber(item.quantity), 0);

  return {
    id: row.id,
    orderNumber: row.order_number,
    platform: platformLabel[row.platform],
    customer: row.customer_name || "-",
    product: firstItem?.name ?? "Order item",
    sku: firstItem?.sku ?? "-",
    qty: Math.max(1, quantity || 1),
    status: statusToUi[row.status],
    trackingNumber: row.tracking_number ?? "-",
    carrier: mapCarrier(row.carrier),
    paidAt: formatOperationTime(row.paid_at, "-"),
    packBy: formatOperationTime(row.pack_by, "-"),
    note: row.note ?? "",
    priority: priorityLabel[row.priority],
  };
}

function relatedOrderNumber(orderId: string | null, orders: OperationOrderRow[]) {
  if (!orderId) return "-";
  return orders.find((order) => order.id === orderId)?.order_number ?? "-";
}

function mapReturnCase(row: ReturnCaseRow, orders: OperationOrderRow[]): MockReturnCase {
  return {
    id: row.id,
    caseNumber: row.case_number,
    orderNumber: relatedOrderNumber(row.order_id, orders),
    customer: row.customer_name || "-",
    platform: platformLabel[row.platform],
    reason: (row.reason as ReturnCaseStatus) || returnTypeToReason[row.case_type],
    status: returnStatusToUi[row.status],
    costImpact: toNumber(row.cost_impact),
    evidenceLabel: row.evidence_label ?? "-",
    suggestedAction: row.suggested_action ?? "-",
    updatedAt: formatOperationTime(row.updated_at, "-"),
  };
}

function mapClaimCase(row: ClaimCaseRow, orders: OperationOrderRow[]): MockReturnCase {
  const order = row.order_id ? orders.find((item) => item.id === row.order_id) : null;

  return {
    id: row.id,
    caseNumber: row.claim_number,
    orderNumber: order?.order_number ?? "-",
    customer: order?.customer_name ?? "-",
    platform: order ? platformLabel[order.platform] : "Shopee",
    reason: claimTypeToReason[row.claim_type],
    status: claimStatusToUi[row.status],
    costImpact: Math.max(toNumber(row.requested_amount) - toNumber(row.approved_amount), 0),
    evidenceLabel: row.evidence_status,
    suggestedAction: row.status === "paid" ? "Claim paid" : "Follow claim evidence and marketplace response",
    updatedAt: formatOperationTime(row.updated_at, "-"),
  };
}

export function buildOrderPipelineCounts(orders: MockOrder[]) {
  return orderPipeline.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
}

export function listPackingQueueFromOrders(orders: MockOrder[]) {
  return orders.filter((order) => packingQueueStatuses.has(order.status));
}

export async function listOrders(organizationId?: string): Promise<OperationsResult<MockOrder[]>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session, organizationId);
  const mockData = scopedMockOrders();

  if (!useSupabaseData) {
    return { data: mockData, source: "mock" };
  }

  const supabase = await createClient();
  if (!supabase) return { data: mockData, source: "mock" };

  let orderQuery = supabase
    .from("operation_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (session?.role !== "SUPER_ADMIN") {
    orderQuery = orderQuery.eq("organization_id", orgId);
  }

  const { data: orders, error: orderError } = await orderQuery;
  if (orderError) return { data: mockData, source: "mock", error: orderError.message };
  if (!orders?.length) return { data: mockData, source: "mock", error: "no_rows" };

  const orderRows = orders as OperationOrderRow[];
  const orderIds = orderRows.map((order) => order.id);
  const { data: items, error: itemError } = await supabase
    .from("operation_order_items")
    .select("*")
    .in("order_id", orderIds);

  if (itemError) return { data: mockData, source: "mock", error: itemError.message };

  const itemRows = (items ?? []) as OperationOrderItemRow[];
  return {
    data: orderRows.map((order) => mapOrder(order, itemRows)),
    source: "supabase",
  };
}

export async function getOrderById(id: string): Promise<OperationsResult<MockOrder | null>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session);
  const mockOrder = mockOrders.find((order) => order.id === id || order.orderNumber === id) ?? null;

  if (!useSupabaseData) return { data: mockOrder, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { data: mockOrder, source: "mock" };

  const column = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    ? "id"
    : "order_number";
  let query = supabase.from("operation_orders").select("*").eq(column, id);

  if (session?.role !== "SUPER_ADMIN") {
    query = query.eq("organization_id", orgId);
  }

  const { data: order, error } = await query.maybeSingle();
  if (error) return { data: mockOrder, source: "mock", error: error.message };
  if (!order) return { data: null, source: "supabase" };

  const { data: items, error: itemError } = await supabase
    .from("operation_order_items")
    .select("*")
    .eq("order_id", (order as OperationOrderRow).id);

  if (itemError) return { data: mockOrder, source: "mock", error: itemError.message };

  return {
    data: mapOrder(order as OperationOrderRow, (items ?? []) as OperationOrderItemRow[]),
    source: "supabase",
  };
}

export async function createOrder(input: CreateOrderInput): Promise<OrderMutationResult> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session);

  if (!useSupabaseData) return { ok: true, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { ok: true, source: "mock" };
  if (!session) return { ok: false, source: "supabase", error: "ไม่ได้เข้าสู่ระบบ" };

  const { data: order, error } = await supabase
    .from("operation_orders")
    .insert({
      organization_id: orgId,
      store_id: input.storeId ?? null,
      platform: input.platform,
      external_order_id: input.externalOrderId ?? null,
      order_number: input.orderNumber,
      customer_name: input.customerName,
      status: input.status ?? "pending_label",
      priority: input.priority ?? "normal",
      paid_at: input.paidAt ?? null,
      pack_by: input.packBy ?? null,
      ship_by: input.shipBy ?? null,
      carrier: input.carrier ?? null,
      tracking_number: input.trackingNumber ?? null,
      note: input.note ?? null,
      source: "manual",
    })
    .select("*")
    .single();

  if (error || !order) return { ok: false, source: "supabase", error: error?.message ?? "create_failed" };

  const orderRow = order as OperationOrderRow;
  const itemRows = input.items.map((item) => ({
    organization_id: orgId,
    order_id: orderRow.id,
    product_id: item.productId ?? null,
    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice ?? 0,
    unit_cost: item.unitCost ?? 0,
  }));

  if (itemRows.length > 0) {
    const { error: itemError } = await supabase.from("operation_order_items").insert(itemRows);
    if (itemError) return { ok: false, source: "supabase", error: itemError.message };
  }

  await supabase.from("operation_status_events").insert({
    organization_id: orgId,
    order_id: orderRow.id,
    event_type: "manual_created",
    to_status: orderRow.status,
    actor_profile_id: session.userId,
    note: "Created from AI Commerce OS",
  });

  return {
    ok: true,
    source: "supabase",
    order: mapOrder(orderRow, itemRows as OperationOrderItemRow[]),
  };
}

export async function recordOrderAction(orderId: string, action: OrderAction): Promise<OrderMutationResult> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session);

  if (!useSupabaseData) return { ok: true, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { ok: true, source: "mock" };
  if (!session) return { ok: false, source: "supabase", error: "ไม่ได้เข้าสู่ระบบ" };

  const column = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)
    ? "id"
    : "order_number";
  let query = supabase.from("operation_orders").select("*").eq(column, orderId);

  if (session.role !== "SUPER_ADMIN") {
    query = query.eq("organization_id", orgId);
  }

  const { data: existingOrder, error: readError } = await query.maybeSingle();
  if (readError) return { ok: true, source: "mock", error: readError.message };
  if (!existingOrder) return { ok: true, source: "mock" };

  const order = existingOrder as OperationOrderRow;
  const nextStatus = actionStatus[action];
  const { data: updatedOrder, error: updateError } = await supabase
    .from("operation_orders")
    .update({ status: nextStatus })
    .eq("id", order.id)
    .select("*")
    .single();

  if (updateError || !updatedOrder) {
    return { ok: false, source: "supabase", error: updateError?.message ?? "update_failed" };
  }

  await supabase.from("operation_status_events").insert({
    organization_id: order.organization_id,
    order_id: order.id,
    event_type: actionEventType[action],
    from_status: order.status,
    to_status: nextStatus,
    actor_profile_id: session.userId,
    note: `Order action: ${action}`,
  });

  if (action === "pack" || action === "ready") {
    await supabase.from("packing_tasks").upsert(
      {
        organization_id: order.organization_id,
        order_id: order.id,
        status: action === "ready" ? "ready_to_ship" : "scanning",
        started_at: action === "pack" ? new Date().toISOString() : undefined,
        completed_at: action === "ready" ? new Date().toISOString() : undefined,
        assigned_to: session.userId,
      },
      { onConflict: "organization_id,order_id" },
    );
  }

  const { data: items } = await supabase.from("operation_order_items").select("*").eq("order_id", order.id);

  return {
    ok: true,
    source: "supabase",
    order: mapOrder(updatedOrder as OperationOrderRow, (items ?? []) as OperationOrderItemRow[]),
  };
}

async function loadRelatedOrders(orderIds: string[]) {
  const supabase = await createClient();
  if (!supabase || orderIds.length === 0) return [] as OperationOrderRow[];

  const { data } = await supabase.from("operation_orders").select("*").in("id", orderIds);
  return (data ?? []) as OperationOrderRow[];
}

export async function listReturnCases(organizationId?: string): Promise<OperationsResult<MockReturnCase[]>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session, organizationId);

  if (!useSupabaseData) return { data: mockReturnCases, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { data: mockReturnCases, source: "mock" };

  let returnQuery = supabase.from("return_cases").select("*").order("updated_at", { ascending: false });
  let claimQuery = supabase.from("claim_cases").select("*").order("updated_at", { ascending: false });

  if (session?.role !== "SUPER_ADMIN") {
    returnQuery = returnQuery.eq("organization_id", orgId);
    claimQuery = claimQuery.eq("organization_id", orgId);
  }

  const [{ data: returns, error: returnError }, { data: claims, error: claimError }] = await Promise.all([
    returnQuery,
    claimQuery,
  ]);

  if (returnError || claimError) {
    return {
      data: mockReturnCases,
      source: "mock",
      error: returnError?.message ?? claimError?.message,
    };
  }

  const returnRows = (returns ?? []) as ReturnCaseRow[];
  const claimRows = (claims ?? []) as ClaimCaseRow[];
  if (returnRows.length === 0 && claimRows.length === 0) {
    return { data: mockReturnCases, source: "mock", error: "no_rows" };
  }

  const orderIds = Array.from(
    new Set([
      ...returnRows.map((item) => item.order_id).filter((value): value is string => Boolean(value)),
      ...claimRows.map((item) => item.order_id).filter((value): value is string => Boolean(value)),
    ]),
  );
  const orderRows = await loadRelatedOrders(orderIds);

  return {
    data: [
      ...returnRows.map((item) => mapReturnCase(item, orderRows)),
      ...claimRows.map((item) => mapClaimCase(item, orderRows)),
    ],
    source: "supabase",
  };
}

export async function createReturnCase(input: CreateReturnCaseInput): Promise<OrderMutationResult> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session);

  if (!useSupabaseData) return { ok: true, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { ok: true, source: "mock" };
  if (!session) return { ok: false, source: "supabase", error: "ไม่ได้เข้าสู่ระบบ" };

  const { error } = await supabase.from("return_cases").insert({
    organization_id: orgId,
    order_id: input.orderId ?? null,
    case_number: input.caseNumber,
    platform: input.platform,
    external_case_id: input.externalCaseId ?? null,
    case_type: input.caseType ?? "return",
    status: input.status ?? "opened",
    customer_name: input.customerName,
    reason: input.reason,
    cost_impact: input.costImpact ?? 0,
    evidence_label: input.evidenceLabel ?? null,
    suggested_action: input.suggestedAction ?? null,
    due_at: input.dueAt ?? null,
  });

  if (error) return { ok: false, source: "supabase", error: error.message };
  return { ok: true, source: "supabase" };
}

export async function updateReturnCase(id: string, input: UpdateReturnCaseInput): Promise<OrderMutationResult> {
  if (!useSupabaseData) return { ok: true, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { ok: true, source: "mock" };

  const { error } = await supabase
    .from("return_cases")
    .update({
      status: input.status,
      reason: input.reason,
      cost_impact: input.costImpact,
      evidence_label: input.evidenceLabel,
      suggested_action: input.suggestedAction,
      due_at: input.dueAt,
      resolved_at: input.resolvedAt,
    })
    .eq("id", id);

  if (error) return { ok: false, source: "supabase", error: error.message };
  return { ok: true, source: "supabase" };
}

export async function createClaimCase(input: CreateClaimCaseInput): Promise<OrderMutationResult> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session);

  if (!useSupabaseData) return { ok: true, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { ok: true, source: "mock" };
  if (!session) return { ok: false, source: "supabase", error: "ไม่ได้เข้าสู่ระบบ" };

  const { error } = await supabase.from("claim_cases").insert({
    organization_id: orgId,
    return_case_id: input.returnCaseId ?? null,
    order_id: input.orderId ?? null,
    claim_number: input.claimNumber,
    claim_type: input.claimType,
    status: input.status ?? "opened",
    carrier: input.carrier ?? null,
    requested_amount: input.requestedAmount ?? 0,
    approved_amount: input.approvedAmount ?? 0,
    evidence_status: input.evidenceStatus ?? "not_started",
    owner_profile_id: session.userId,
  });

  if (error) return { ok: false, source: "supabase", error: error.message };
  return { ok: true, source: "supabase" };
}

export async function updateClaimCase(id: string, input: UpdateClaimCaseInput): Promise<OrderMutationResult> {
  if (!useSupabaseData) return { ok: true, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { ok: true, source: "mock" };

  const { error } = await supabase
    .from("claim_cases")
    .update({
      status: input.status,
      carrier: input.carrier,
      requested_amount: input.requestedAmount,
      approved_amount: input.approvedAmount,
      evidence_status: input.evidenceStatus,
      submitted_at: input.submittedAt,
      resolved_at: input.resolvedAt,
    })
    .eq("id", id);

  if (error) return { ok: false, source: "supabase", error: error.message };
  return { ok: true, source: "supabase" };
}
