import { NavLink } from "react-router-dom";
import "../styles/navbar.css";

function Navbar({ searchTerm, setSearchTerm, cartCount, currentUser, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo">FD</span>
        <div>
          <strong>FoodDash</strong>
          <p>Fast delivery, bold flavor</p>
        </div>
      </div>

      <nav className="navbar__links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/menu">Menu</NavLink>
        <NavLink to="/cart">Cart {cartCount ? `(${cartCount})` : ""}</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/admin/login">Admin</NavLink>
      </nav>

      <div className="navbar__right">
        <input
          className="navbar__search"
          type="text"
          placeholder="Search meals, desserts, bowls..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {currentUser ? (
          <button className="navbar__logout" type="button" onClick={onLogout}>
            {currentUser.name.split(" ")[0]} Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
