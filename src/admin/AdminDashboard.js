import { Link } from "react-router-dom";
import "../styles/admin.css";

function AdminDashboard({ itemCount, orderCount, userCount }) {
  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="admin-eyebrow">Control Center</p>
          <h1>FoodDash Admin Dashboard</h1>
          <p>Track menu growth, active orders, and community performance in one place.</p>
        </div>
        <div className="admin-actions">
          <Link to="/admin/add-food">Add Food</Link>
          <Link to="/admin/manage-orders">Manage Orders</Link>
          <Link to="/admin/users">Users</Link>
        </div>
      </section>

      <section className="admin-grid">
        <article className="admin-card">
          <h2>{itemCount}</h2>
          <p>Menu items</p>
        </article>
        <article className="admin-card">
          <h2>{orderCount}</h2>
          <p>Orders today</p>
        </article>
        <article className="admin-card">
          <h2>{userCount}</h2>
          <p>Active users</p>
        </article>
      </section>
    </main>
  );
}

export default AdminDashboard;
