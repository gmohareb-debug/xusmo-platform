import React from "react";

export function OrderHistory({ title = "Order History", orders = [] }) {
  if (orders.length === 0) {
    return (
      <div className="order-history">
        <h2 className="order-history-title">{title}</h2>
        <p className="order-history-empty">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h2 className="order-history-title">{title}</h2>
      <table className="order-history-table">
        <thead>
          <tr>
            <th className="order-history-th">Order ID</th>
            <th className="order-history-th">Date</th>
            <th className="order-history-th">Items</th>
            <th className="order-history-th">Total</th>
            <th className="order-history-th">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id || index} className="order-history-row">
              <td className="order-history-td">{order.id}</td>
              <td className="order-history-td">{order.date}</td>
              <td className="order-history-td">
                {Array.isArray(order.items)
                  ? order.items.join(", ")
                  : order.items}
              </td>
              <td className="order-history-td">{order.total}</td>
              <td className="order-history-td">
                <span className={`order-history-status order-history-status-${(order.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
