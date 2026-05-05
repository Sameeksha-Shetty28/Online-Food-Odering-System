import { useState } from "react";
import "../styles/admin.css";

function AddFood({ onAddFood }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onAddFood({
      ...formData,
      price: Number(formData.price)
    });
    setFormData({ name: "", price: "", category: "", image: "", description: "" });
  };

  return (
    <main className="admin-page">
      <section className="admin-form-card">
        <h1>Add New Dish</h1>
        <form className="admin-form" onSubmit={handleSubmit}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Dish name" required />
          <input name="price" value={formData.price} onChange={handleChange} placeholder="Price" type="number" required />
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
          <input name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short description" rows="4" required />
          <button type="submit">Add to Menu</button>
        </form>
      </section>
    </main>
  );
}

export default AddFood;
