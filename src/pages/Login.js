import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/home.css";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onLogin(formData);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    navigate("/profile");
  };

  return (
    <main className="page form-page">
      <div className="form-card">
        <h1>Welcome back</h1>
        <p>Log in with a registered account to reopen your personal profile and order history.</p>
        {location.state?.registrationMessage ? (
          <p className="form-success">{location.state.registrationMessage}</p>
        ) : null}
        <form className="form-stack" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="hero__button hero__button--solid">
            Login
          </button>
        </form>
        <p className="form-helper">
          New here? <Link to="/register">Register first</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
