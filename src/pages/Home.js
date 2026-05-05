import { Link } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import "../styles/home.css";

function Home({ featuredItems, onAddToCart }) {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero__copy">
          <span className="hero__tag">Chef-crafted picks</span>
          <h1>Order restaurant-style meals without leaving home.</h1>
          <p>
            Discover premium burgers, artisan pizzas, rich pasta, and comforting bowls in one
            modern food experience.
          </p>
          <div className="hero__actions">
            <Link to="/menu" className="hero__button hero__button--solid">
              Explore Menu
            </Link>
            <Link to="/register" className="hero__button hero__button--ghost">
              Join FoodDash
            </Link>
          </div>
        </div>
        <div className="hero__panel">
          <div className="hero__stat">
            <strong>20 min</strong>
            <span>Average delivery time</span>
          </div>
          <div className="hero__stat">
            <strong>50k+</strong>
            <span>Happy food lovers</span>
          </div>
          <div className="hero__stat">
            <strong>4.8/5</strong>
            <span>Customer rating</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__heading">
          <div>
            <h2>Featured dishes</h2>
            <p>Popular choices picked by our customers today.</p>
          </div>
        </div>
        <div className="menu-grid">
          {featuredItems.map((item) => (
            <FoodCard key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
