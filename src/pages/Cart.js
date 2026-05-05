import { useState } from "react";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import "../styles/home.css";

function Cart({ cartItems, cartTotal, onIncrease, onDecrease, currentUser, onPlaceOrder }) {
  const [message, setMessage] = useState("");

  const handlePlaceOrder = () => {
    const result = onPlaceOrder();
    setMessage(result.message);
  };

  return (
    <main className="page">
      <section className="section cart-layout">
        <div>
          <div className="section__heading">
            <div>
              <h1>Your cart</h1>
              <p>Everything you need for a delicious evening.</p>
            </div>
          </div>

          {cartItems.length ? (
            <div className="cart-list">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} onIncrease={onIncrease} onDecrease={onDecrease} />
              ))}
            </div>
          ) : (
            <div className="empty-panel">Your cart is empty. Add something from the menu.</div>
          )}
        </div>

        <aside className="summary-card">
          <h2>Order summary</h2>
          <p className="summary-card__note">
            {currentUser
              ? `Ordering as ${currentUser.name}`
              : "Please register and log in before placing an order."}
          </p>
          <div className="summary-card__row">
            <span>Items</span>
            <strong>{cartItems.length}</strong>
          </div>
          <div className="summary-card__row">
            <span>Delivery</span>
            <strong>Free</strong>
          </div>
          <div className="summary-card__row summary-card__row--total">
            <span>Total</span>
            <strong>Rs. {cartTotal}</strong>
          </div>
          {message ? <p className="form-success">{message}</p> : null}
          <button className="hero__button hero__button--solid" type="button" onClick={handlePlaceOrder}>
            Place Order
          </button>
          {!currentUser ? (
            <Link className="hero__button hero__button--ghost" to="/register">
              Register to Order
            </Link>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

export default Cart;
