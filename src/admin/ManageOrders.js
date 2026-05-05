import OrderTracker from "../components/OrderTracker";
import "../styles/admin.css";

function ManageOrders({ orders }) {
  return (
    <main className="admin-page">
      <section className="admin-form-card">
        <h1>Manage Orders</h1>
        <div className="order-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-card__top">
                <strong>{order.id}</strong>
                <span>{order.customer}</span>
              </div>
              <p>{order.item}</p>
              <strong>Rs. {order.total}</strong>
              <OrderTracker status={order.status} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ManageOrders;
