import React from "react";

const statusColors = {
  completed: { bg: '#dcfce7', color: '#166534' },
  delivered: { bg: '#dcfce7', color: '#166534' },
  processing: { bg: '#fef9c3', color: '#854d0e' },
  pending: { bg: '#fef9c3', color: '#854d0e' },
  shipped: { bg: '#dbeafe', color: '#1e40af' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
  refunded: { bg: '#f3e8ff', color: '#6b21a8' },
};

function getStatusStyle(status) {
  const key = (status || '').toLowerCase().replace(/\s+/g, '-');
  return statusColors[key] || { bg: 'var(--border, #e5e7eb)', color: 'var(--text, #1c1c1c)' };
}

export function OrderHistory({ title = "Order History", orders = [] }) {
  if (orders.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8" style={{ color: 'var(--text, #1c1c1c)' }}>
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted, #6b7280)' }}>No orders found.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8" style={{ color: 'var(--text, #1c1c1c)' }}>
      <h2
        className="text-2xl md:text-3xl font-bold mb-6"
        style={{ fontFamily: 'var(--font-heading, inherit)' }}
      >
        {title}
      </h2>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border, #e5e7eb)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface, #fff)', borderBottom: '2px solid var(--border, #e5e7eb)' }}>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--muted, #6b7280)' }}>Order ID</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--muted, #6b7280)' }}>Date</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--muted, #6b7280)' }}>Items</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--muted, #6b7280)' }}>Total</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--muted, #6b7280)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.id || index}
                className="transition-colors duration-150"
                style={{ borderBottom: '1px solid var(--border, #e5e7eb)', backgroundColor: index % 2 === 0 ? 'var(--surface, #fff)' : 'transparent' }}
              >
                <td className="px-4 py-3 font-medium">{order.id}</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted, #6b7280)' }}>{order.date}</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted, #6b7280)' }}>
                  {Array.isArray(order.items) ? order.items.join(", ") : order.items}
                </td>
                <td className="px-4 py-3 font-semibold">{order.total}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                    style={{ backgroundColor: getStatusStyle(order.status).bg, color: getStatusStyle(order.status).color }}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {orders.map((order, index) => (
          <div
            key={order.id || index}
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">#{order.id}</span>
              <span
                className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                style={{ backgroundColor: getStatusStyle(order.status).bg, color: getStatusStyle(order.status).color }}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted, #6b7280)' }}>{order.date}</p>
            <p className="text-sm mb-2" style={{ color: 'var(--muted, #6b7280)' }}>
              {Array.isArray(order.items) ? order.items.join(", ") : order.items}
            </p>
            <p className="text-base font-bold">{order.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
