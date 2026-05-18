import { getAppSession, resolveOrganizationId } from "@/lib/auth/session";
import {
  mockOrders,
  orderPipeline,
  type MockOrder,
  type OperationPlatform,
  type OrderPipelineStatus,
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
