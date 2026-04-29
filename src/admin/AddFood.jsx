import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "./adminApi";
import "../styles/admin.css";

function AddFood({ onAddFood }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    const payload = {
      ...formData,
      price: Number(formData.price)
    };

    try {
      const response = await adminFetch(
        "/admin/foods",
        {
          method: "POST",
          body: JSON.stringify(payload)
        },
        navigate
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to add food");
      }

      onAddFood(data.food || payload);
      setMessage("Food added successfully.");
      setFormData({ name: "", price: "", category: "", image: "", description: "" });
    } catch (err) {
      if (!err.message.includes("Admin token")) {
        setError(err.message || "Unable to add food");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-form-card">
        <h1>Add New Dish</h1>
        <form className="admin-form" onSubmit={handleSubmit}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Dish name" required />
          <input name="price" value={formData.price} onChange={handleChange} placeholder="Price" type="number" min="1" required />
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
          <input name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short description" rows="4" required />
          {message ? <p className="admin-success">{message}</p> : null}
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add to Menu"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AddFood;
