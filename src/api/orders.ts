// api/orders.ts
import axios from 'axios';

export type OrderStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderDto = {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  deliverySlot?: string;
  status: OrderStatus;
  updatedAt: string;
};

type GetOrdersResponse = {
  orders: OrderDto[];
  total: number;
};

export async function fetchGroupedOrders(params: {
  customerId: string;
  search?: string;
  statuses?: OrderStatus[];
  page?: number;
}): Promise<GetOrdersResponse> {
  try {
    const response = await axios.get(
      `/api/orders/grouped` +
        `?customerId=${params.customerId}` +
        `&search=${params.search ?? ''}` +
        `&statuses=${params.statuses?.join(',') ?? ''}` +
        `&page=${params.page ?? 0}`
    );

    return response.data;
  } catch (e) {
    console.error('failed to fetch grouped orders', e);

    return {
      orders: [],
      total: 0,
    };
  }
}

export async function cancelOrder(orderId: string) {
  await axios.post(`/api/orders/${orderId}/cancel`);
}