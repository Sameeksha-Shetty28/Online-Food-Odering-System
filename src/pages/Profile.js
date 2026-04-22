import "../styles/home.css";

function Profile({ currentUser, userOrders }) {
  const user = currentUser || {
    name: "Guest User",
    email: "guest@example.com",
    phone: "+91 90000 00000",
    address: "Add your delivery address",
    membership: "Guest",
    bio: "Please login or register to personalize this profile.",
    points: 0
  };

  return (
    <main className="page">
      <section className="section profile-card">
        <div>
          <span className="hero__tag">{user.membership}</span>
          <h1>{user.name}</h1>
          <p>{user.bio}</p>
        </div>
        <div className="profile-grid">
          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{user.phone}</strong>
          </div>
          <div>
            <span>Address</span>
            <strong>{user.address}</strong>
          </div>
          <div>
            <span>Loyalty Points</span>
            <strong>{user.points}</strong>
          </div>
        </div>
        <div className="profile-orders">
          <h2>Your Orders</h2>
          {userOrders && userOrders.length ? (
            <div className="profile-orders__list">
              {userOrders.map((order) => (
                <article key={order.id} className="profile-orders__card">
                  <div>
                    <strong>{order.id}</strong>
                    <p>{order.item}</p>
                  </div>
                  <div>
                    <span>{order.status}</span>
                    <strong>Rs. {order.total}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-panel">No personal orders yet. Place one from your cart.</div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Profile;
