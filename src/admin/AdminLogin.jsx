import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ADMIN_TOKEN_KEY, API_BASE_URL } from "./adminApi";
import "../styles/admin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (localStorage.getItem(ADMIN_TOKEN_KEY)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        throw new Error("Invalid Admin Credentials");
      }

      const data = await response.json();
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem("adminAuth", "true");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError("Invalid Admin Credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-form-card admin-login-card">
        <p className="admin-eyebrow">Admin Access</p>
        <h1>FoodDash Admin Login</h1>
        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Admin email"
            type="email"
            required
          />
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            required
          />
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
