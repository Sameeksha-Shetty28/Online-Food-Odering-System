import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "./adminApi";
import "../styles/admin.css";

function DeleteFood({ onFoodDeleted }) {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
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

    loadFoods();
  }, [navigate]);

  const handleDelete = async (foodId) => {
    setError("");
    setMessage("");
    console.log("Before delete food ID:", foodId);

    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) {
      return;
    }

    setDeletingId(foodId);

    try {
      const response = await adminFetch(`/admin/foods/${foodId}`, { method: "DELETE" }, navigate);
      const data = await response.json();
      console.log("Delete food response:", response.status, data);

      if (!response.ok) {
        throw new Error(data.detail || "Unable to delete food");
      }

      setFoods((currentFoods) =>
        currentFoods.filter((food) => food._id !== foodId && food.id !== foodId)
      );
      onFoodDeleted(foodId);
      setMessage("Food deleted successfully.");
    } catch (err) {
      if (!err.message.includes("Admin token")) {
        setError(err.message || "Unable to delete food");
      }
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-form-card">
        <h1>Delete Food</h1>
        {message ? <p className="admin-success">{message}</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {isLoading ? <p className="admin-muted">Loading food items...</p> : null}
        {!isLoading && !foods.length ? <p className="admin-muted">No food items</p> : null}

        <div className="admin-food-grid">
          {foods.map((food) => {
            const foodId = food.id || food._id;
            return (
              <article className="admin-food-card" key={foodId}>
                <img src={food.image} alt={food.name} />
                <div className="admin-food-card__body">
                  <div className="admin-food-card__top">
                    <h3>{food.name}</h3>
                    <strong>Rs. {food.price}</strong>
                  </div>
                  <span>{food.category}</span>
                  <button
                    className="admin-delete-button"
                    type="button"
                    onClick={() => handleDelete(foodId)}
                    disabled={deletingId === foodId}
                  >
                    {deletingId === foodId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default DeleteFood;
