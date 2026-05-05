import "../styles/admin.css";

function Users({ users, orders }) {
  return (
    <main className="admin-page">
      <section className="admin-form-card">
        <h1>Users</h1>
        <div className="user-list">
          {users.map((user) => (
            <article key={user.id} className="user-card">
              <div>
                <h3>{user.name}</h3>
                <p>{user.membership} member</p>
                <span>{user.email}</span>
                <span>{user.phone}</span>
              </div>
              <div className="user-card__meta">
                <strong>{user.orders} orders</strong>
                <span>
                  Latest:{" "}
                  {orders.find((order) => order.userId === user.id)?.item || "No orders yet"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Users;
