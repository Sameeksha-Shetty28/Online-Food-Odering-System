import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "./adminApi";
import "../styles/admin.css";

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await adminFetch("/admin/users", { method: "GET" }, navigate);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load users");
        }

        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err) {
        if (!err.message.includes("Admin token")) {
          setError(err.message || "Unable to load users");
        }
      }
    };

    loadUsers();
  }, [navigate]);

  return (
    <main className="admin-page">
      <section className="admin-form-card">
        <h1>Users</h1>
        <div className="user-list">
          {users.map((user) => (
            <article key={user.id || user._id || user.email} className="user-card">
              <div>
                <h3>{user.name || "FoodDash User"}</h3>
                <p>{user.membership || user.role || "Customer"} member</p>
                <span>{user.email}</span>
                <span>{user.phone || "No phone added"}</span>
              </div>
              <div className="user-card__meta">
                <strong>{user.orders || 0} orders</strong>
                <span>{user.points || 0} points</span>
              </div>
            </article>
          ))}
        </div>
        {!users.length && !error ? <p className="admin-muted">No users found.</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
      </section>
    </main>
  );
}

export default Users;
