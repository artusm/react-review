// hooks/useGroupedOrders.ts
import { useEffect, useMemo, useState } from 'react';

import {
  cancelOrder,
  fetchGroupedOrders,
  type OrderDto,
  type OrderStatus,
} from '../api/orders';

type Filters = {
  search: string;
  statuses: OrderStatus[];
};

export function useGroupedOrders(
  customerId: string | undefined,
  filters: Filters
) {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  async function loadOrders() {
    if (!customerId) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchGroupedOrders({
        customerId,
        search: filters.search,
        statuses: filters.statuses,
        page,
      });

      response.orders.sort((a, b) => {
        if (!a.deliverySlot) return 1;
        if (!b.deliverySlot) return -1;

        return a.deliverySlot.localeCompare(b.deliverySlot);
      });

      setOrders(response.orders);
      setTotal(response.total);
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [customerId, filters, page]);

  const deliveredCount = useMemo(() => {
    return orders.filter(
      (order) => order.status === 'DELIVERED'
    ).length;
  }, [orders]);

  async function cancel(orderId: string) {
    await cancelOrder(orderId);

    const order = orders.find(
      (order) => order.id === orderId
    );

    if (order) {
      order.status = 'CANCELLED';
    }

    setOrders(orders);
  }

  return {
    orders,
    total,
    loading,
    error,
    page,
    setPage,
    deliveredCount,
    cancel,
    reload: loadOrders,
  };
}