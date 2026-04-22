function CartItem({ item, onIncrease, onDecrease }) {
  return (
    <article className="cart-card">
      <img className="cart-card__image" src={item.image} alt={item.name} />
      <div className="cart-card__content">
        <div>
          <h3>{item.name}</h3>
          <p>{item.category}</p>
        </div>
        <strong>Rs. {item.price * item.quantity}</strong>
      </div>
      <div className="cart-card__controls">
        <button type="button" onClick={() => onDecrease(item.id)}>
          -
        </button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => onIncrease(item.id)}>
          +
        </button>
      </div>
    </article>
  );
}

export default CartItem;
