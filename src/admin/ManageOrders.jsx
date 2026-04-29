import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderTracker from "../components/OrderTracker";
import { adminFetch } from "./adminApi";
import "../styles/admin.css";

function ManageOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await adminFetch("/admin/orders", { method: "GET" }, navigate);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load orders");
        }

        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        if (!err.message.includes("Admin token")) {
          setError(err.message || "Unable to load orders");
        }
      }
    };

    loadOrders();
  }, [navigate]);

  return (
    <main className="admin-page">
      <section className="admin-form-card">
        <h1>Manage Orders</h1>
        <div className="order-list">
          {orders.map((order) => (
            <article key={order.id || order._id} className="order-card">
              <div className="order-card__top">
                <strong>{order.id || order._id}</strong>
                <span>{order.customer || order.userId || "Customer"}</span>
              </div>
              <p>{order.item || order.items?.map((item) => `${item.name} x${item.quantity}`).join(", ") || "Order items"}</p>
              <strong>Rs. {order.total || order.totalAmount || 0}</strong>
              <OrderTracker status={order.status || "Placed"} />
            </article>
          ))}
        </div>
        {!orders.length && !error ? <p className="admin-muted">No orders found.</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
      </section>
    </main>
  );
}

export default ManageOrders;
