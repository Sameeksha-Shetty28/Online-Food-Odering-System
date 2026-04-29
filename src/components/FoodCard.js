import "../styles/foodcard.css";

function FoodCard({ item, onAddToCart }) {
  return (
    <article className="food-card">
      <img src={item.image} alt={item.name} />
      <div className="food-card__content">
        <span className="food-card__badge">{item.category}</span>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="food-card__footer">
          <strong>Rs. {item.price}</strong>
          <button type="button" onClick={() => onAddToCart(item)}>
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

export default FoodCard;
