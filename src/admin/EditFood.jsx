import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "./adminApi";
import "../styles/admin.css";

const emptyFood = {
  name: "",
  price: "",
  category: "",
  image: "",
  description: ""
};

function EditFood() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [formData, setFormData] = useState(emptyFood);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFoods = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await adminFetch("/admin/foods", { method: "GET" }, navigate);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load foods.");
      }

      setFoods(Array.isArray(data.foods) ? data.foods : []);
    } catch (err) {
      if (!err.message.includes("Admin token")) {
        setError(err.message || "Unable to load foods.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const openEditForm = (food) => {
    setSelectedFood(food);
    setMessage("");
    setError("");
    setFormData({
      name: food.name || "",
      price: food.price || "",
      category: food.category || "",
      image: food.image || "",
      description: food.description || ""
    });
  };

  const closeEditForm = () => {
    setSelectedFood(null);
    setFormData(emptyFood);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFood) {
      return;
    }

    setMessage("");
    setError("");
    setIsSubmitting(true);

    const foodId = selectedFood.id || selectedFood._id;

    try {
      const response = await adminFetch(
        `/admin/foods/${foodId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price)
          })
        },
        navigate
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update food");
      }

      setMessage("Food updated successfully.");
      setFoods((currentFoods) =>
        currentFoods.map((food) =>
          (food.id || food._id) === foodId ? data.food : food
        )
      );
      closeEditForm();
      await loadFoods();
    } catch (err) {
      if (!err.message.includes("Admin token")) {
        setError(err.message || "Unable to update food");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-form-card">
        <h1>Update Food</h1>
        {message ? <p className="admin-success">{message}</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {isLoading ? <p className="admin-muted">Loading food items...</p> : null}
        {!isLoading && !foods.length ? <p className="admin-muted">No food items</p> : null}

        <div className="admin-food-grid">
          {foods.map((food) => (
            <article className="admin-food-card" key={food.id || food._id}>
              <img src={food.image} alt={food.name} />
              <div className="admin-food-card__body">
                <div className="admin-food-card__top">
                  <h3>{food.name}</h3>
                  <strong>Rs. {food.price}</strong>
                </div>
                <span>{food.category}</span>
                <p>{food.description}</p>
                <button className="admin-edit-button" type="button" onClick={() => openEditForm(food)}>
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedFood ? (
        <section className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal__top">
              <h2>Edit Food</h2>
              <button type="button" onClick={closeEditForm}>Close</button>
            </div>
            <form className="admin-form" onSubmit={handleSubmit}>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Dish name" required />
              <input name="price" value={formData.price} onChange={handleChange} placeholder="Price" type="number" min="1" required />
              <input name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" required />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short description" rows="4" required />
              <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
              {error ? <p className="admin-error">{error}</p> : null}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default EditFood;
