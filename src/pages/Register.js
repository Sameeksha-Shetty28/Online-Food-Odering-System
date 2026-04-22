import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/home.css";

function Register({ onRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onRegister(formData);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    navigate("/login", { state: { registrationMessage: result.message } });
  };

  return (
    <main className="page form-page">
      <div className="form-card">
        <h1>Create account</h1>
        <p>Create your account first, then log in to get your own profile and order history.</p>
        <form className="form-stack" onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
          />
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="hero__button hero__button--solid">
            Register
          </button>
        </form>
        <p className="form-helper">
          Already registered? <Link to="/login">Go to login</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
