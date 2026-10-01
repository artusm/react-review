// GroupedOrders.tsx
import {
  useMemo,
  useState,
} from 'react';

import { useGroupedOrders } from './hooks/useGroupedOrders';
import type { OrderStatus } from './api/orders';

type Props = {
  customerId?: string;
  initialSearch?: string;
};

export function GroupedOrders({
  customerId,
  initialSearch = '',
}: Props) {
  const [search, setSearch] = useState(initialSearch);

  const [selectedStatuses, setSelectedStatuses] =
    useState<OrderStatus[]>([
      'NEW',
      'ASSIGNED',
      'DELIVERED',
    ]);

  const filters = {
    search: search.trim(),
    statuses: selectedStatuses,
  };

  const {
    orders,
    total,
    loading,
    error,
    page,
    setPage,
    deliveredCount,
    cancel,
  } = useGroupedOrders(customerId, filters);

  const visibleOrders = useMemo(() => {
    const query = search.toLowerCase();

    return orders.filter((order) => {
      if (!query) {
        return true;
      }

      return (
        order.address.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query)
      );
    });
  }, [orders, search]);

  function highlight(text: string) {
    if (!search) {
      return text;
    }

    return text.replace(
      new RegExp(`(${search})`, 'gi'),
      '<mark>$1</mark>'
    );
  }

  return (
    <section>
      <header>
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search orders"
        />

        <select
          multiple
          value={selectedStatuses}
          onChange={(event) => {
            const values = Array.from(
              event.target.selectedOptions
            ).map((option) => option.value as OrderStatus);

            setSelectedStatuses(values);
          }}
        >
          <option value="NEW">New</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <span>
          {deliveredCount} delivered
        </span>
      </header>

      {loading && <div>Loading...</div>}

      {!loading && error && (
        <div>{error}</div>
      )}

      {!loading &&
        !error &&
        orders.length === 0 && (
          <div>No orders found</div>
        )}

      {!loading &&
        !error &&
        visibleOrders.map((order, index) => (
          <article
            key={index}
            className="order-card"
          >
            <div
              dangerouslySetInnerHTML={{
                __html: highlight(
                  order.customerName
                ),
              }}
            />

            <div
              dangerouslySetInnerHTML={{
                __html: highlight(order.address),
              }}
            />

            <div>
              {order.deliverySlot || 'No slot'}
            </div>

            <div>
              Updated:{' '}
              {new Date(
                order.updatedAt
              ).toLocaleString()}
            </div>

            <button
              onClick={() => cancel(order.id)}
            >
              Cancel
            </button>
          </article>
        ))}

      <footer>
        <span>
          Showing {orders.length} of {total}
        </span>

        <button
          disabled={orders.length === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </footer>
    </section>
  );
}