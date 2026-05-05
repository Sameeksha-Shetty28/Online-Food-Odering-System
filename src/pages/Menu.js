import FoodCard from "../components/FoodCard";
import "../styles/home.css";

function Menu({ items, onAddToCart, searchTerm }) {
  return (
    <main className="page">
      <section className="section">
        <div className="section__heading">
          <div>
            <h1>Menu</h1>
            <p>
              {searchTerm
                ? `Showing results for "${searchTerm}".`
                : "Browse bold flavors, comforting classics, and sweet finishes."}
            </p>
          </div>
        </div>

        <div className="menu-grid">
          {items.length ? (
            items.map((item) => (
              <FoodCard key={item.id} item={item} onAddToCart={onAddToCart} />
            ))
          ) : (
            <div className="empty-panel">No meals matched your search. Try another keyword.</div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Menu;
