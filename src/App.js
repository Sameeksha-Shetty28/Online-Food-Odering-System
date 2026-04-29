import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AddFood from "./admin/AddFood.jsx";
import EditFood from "./admin/EditFood.jsx";
import DeleteFood from "./admin/DeleteFood.jsx";
import ManageOrders from "./admin/ManageOrders.jsx";
import Users from "./admin/Users.jsx";
import { clearAdminAuth } from "./admin/adminApi";
const BASE_URL = "http://127.0.0.1:8000/api";

function ProtectedAdminRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? children : <Navigate to="/admin/login" replace />;
}

function AdminSessionWatcher() {
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/admin")) {
      clearAdminAuth();
    }
  }, [location.pathname]);

  useEffect(() => {
    const clearAdminOnExit = () => {
      clearAdminAuth();
    };

    window.addEventListener("beforeunload", clearAdminOnExit);
    return () => {
      window.removeEventListener("beforeunload", clearAdminOnExit);
      clearAdminAuth();
    };
  }, []);

  return null;
}

const starterMenu = [
  {
    id: 1,
    name: "Truffle Burger",
    price: 289,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    category: "Burgers",
    description: "Smoky patty, truffle mayo, cheddar, and crispy onions."
  },
  {
    id: 2,
    name: "Hot Honey Pizza",
    price: 449,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
    category: "Pizza",
    description: "Stone-baked crust with mozzarella, basil, and hot honey drizzle."
  },
  {
    id: 3,
    name: "Dragon Noodles",
    price: 239,
    image:
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80",
    category: "Asian",
    description: "Wok-tossed noodles with chili glaze, vegetables, and sesame."
  },
  {
    id: 4,
    name: "Loaded Burrito Bowl",
    price: 329,
    image:
      "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=900&q=80",
    category: "Bowls",
    description: "Rice, beans, guacamole, roasted corn, and spicy house sauce."
  },
  {
    id: 5,
    name: "Pesto Pasta",
    price: 259,
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
    category: "Pasta",
    description: "Creamy basil pesto pasta with roasted cherry tomatoes."
  },
  {
    id: 6,
    name: "Berry Cheesecake",
    price: 179,
    image:
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80",
    category: "Dessert",
    description: "Silky cheesecake topped with blueberry compote and fresh berries."
  }
];

const starterUsers = [
  {
    id: 1,
    name: "Aarav Mehta",
    email: "aarav@example.com",
    password: "1234",
    phone: "+91 98111 22334",
    address: "12 Indiranagar, Bengaluru",
    membership: "Premium",
    bio: "Loves rice bowls and gourmet burgers.",
    orders: 14,
    points: 1120
  },
  {
    id: 2,
    name: "Sara Khan",
    email: "sara@example.com",
    password: "1234",
    phone: "+91 98222 33445",
    address: "44 Jubilee Hills, Hyderabad",
    membership: "Regular",
    bio: "Always searching for spicy noodles and desserts.",
    orders: 8,
    points: 460
  },
  {
    id: 3,
    name: "Riya Sen",
    email: "riya@example.com",
    password: "1234",
    phone: "+91 98333 44556",
    address: "21 Lake View Road, Bengaluru",
    membership: "Premium",
    bio: "Food enthusiast who loves late-night pasta and seasonal desserts.",
    orders: 21,
    points: 1280
  }
];

const starterOrders = [
  {
    id: "#FD1024",
    userId: 1,
    customer: "Aarav Mehta",
    item: "Hot Honey Pizza",
    total: 449,
    status: "Preparing"
  },
  {
    id: "#FD1025",
    userId: 2,
    customer: "Sara Khan",
    item: "Truffle Burger",
    total: 289,
    status: "Out for delivery"
  },
  {
    id: "#FD1026",
    userId: 3,
    customer: "Riya Sen",
    item: "Dragon Noodles",
    total: 239,
    status: "Delivered"
  }
];

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("fooddash-users");
    return savedUsers ? JSON.parse(savedUsers) : starterUsers;
  });
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("fooddash-orders");
    return savedOrders ? JSON.parse(savedOrders) : starterOrders;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const savedCurrentUser = localStorage.getItem("fooddash-current-user");
    return savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
  });

  const saveBackendAuth = (data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    if (data?.user) {
      localStorage.setItem("fooddash-backend-user", JSON.stringify(data.user));
    }
  };

  const syncCartToBackend = async (items) => {
    if (!currentUser) {
      return;
    }

    try {
      const data = { userId: currentUser.id, items };
      console.log("Sending request:", data);
      const response = await fetch(`${BASE_URL}/cart/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      console.log("Cart API response:", response.status, result);
    } catch (err) {
      console.log("API failed, using local data", err);
    }
  };

  const clearBackendCart = async () => {
    if (!currentUser) {
      return;
    }

    try {
      const data = { userId: currentUser.id };
      console.log("Sending request:", data);
      const response = await fetch(`${BASE_URL}/cart/${currentUser.id}`, {
        method: "DELETE"
      });
      const result = await response.json();
      console.log("Clear cart API response:", response.status, result);
    } catch (err) {
      console.log("API failed, using local data", err);
    }
  };

  useEffect(() => {
    document.title = "Food Ordering System";
  }, []);

  const fetchFoods = useCallback(async () => {
    try {
      console.log("Menu fetch request:", { url: `${BASE_URL}/foods` });
      const response = await fetch(`${BASE_URL}/foods`);
      const data = await response.json();
      console.log("Menu fetch foods:", response.status, data.foods);

      if (Array.isArray(data.foods)) {
        setMenuItems(data.foods);
      }
    } catch (err) {
      console.log("Menu fetch failed, using starter data only as fallback", err);
      setMenuItems((currentItems) => (currentItems.length ? currentItems : starterMenu));
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  useEffect(() => {
    localStorage.setItem("fooddash-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("fooddash-orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("fooddash-current-user", JSON.stringify(currentUser));
      return;
    }

    localStorage.removeItem("fooddash-current-user");
  }, [currentUser]);

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((cartItem) => cartItem.id === item.id);
      let nextItems;

      if (existingItem) {
        nextItems = currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        nextItems = [...currentItems, { ...item, quantity: 1 }];
      }

      if (currentUser) {
        (async () => {
          try {
            const data = { userId: currentUser.id, item: nextItems.find((cartItem) => cartItem.id === item.id) };
            console.log("Sending request:", data);
            const response = await fetch(`${BASE_URL}/cart`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log("Add cart API response:", response.status, result);
          } catch (err) {
            console.log("API failed, using local data", err);
          }
        })();
      }

      return nextItems;
    });
  };

  const increaseQuantity = (id) => {
    setCartItems((currentItems) => {
      const nextItems = currentItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      syncCartToBackend(nextItems);
      return nextItems;
    });
  };

  const decreaseQuantity = (id) => {
    setCartItems((currentItems) => {
      const nextItems = currentItems
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0);
      syncCartToBackend(nextItems);
      return nextItems;
    });
  };

  const addFoodItem = (newItem) => {
    setMenuItems((currentItems) => [{ ...newItem, id: newItem.id || Date.now() }, ...currentItems]);
  };

  const removeFoodItem = (foodId) => {
    setMenuItems((currentItems) =>
      currentItems.filter((food) => food._id !== foodId && food.id !== foodId)
    );
  };

  const loginUser = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.find((user) => user.email.toLowerCase() === normalizedEmail);

    if (!existingUser) {
      return {
        ok: false,
        message: "No account found. Please register before logging in."
      };
    }

    if (existingUser.password !== password.trim()) {
      return {
        ok: false,
        message: "Incorrect password."
      };
    }

    setCurrentUser(existingUser);

    (async () => {
      try {
        const data = {
          email: normalizedEmail,
          password: password.trim()
        };
        console.log("Sending request:", data);
        const response = await fetch(`${BASE_URL}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log("Login API response:", response.status, result);
        saveBackendAuth(result);
      } catch (err) {
        console.log("API failed, using local data", err);
      }
    })();

    return { ok: true };
  };

  const registerUser = ({ name, email, password, phone }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const userExists = users.some((user) => user.email.toLowerCase() === normalizedEmail);

    if (userExists) {
      return {
        ok: false,
        message: "This email is already registered. Please log in."
      };
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
      phone: phone.trim() || "+91 90000 00000",
      address: "Add your delivery address",
      membership: "New Member",
      bio: "New to FoodDash and ready to explore the menu.",
      orders: 0,
      points: 0
    };

    setUsers((currentUsers) => [newUser, ...currentUsers]);

    (async () => {
      try {
        const data = {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          phone: newUser.phone
        };
        console.log("Sending request:", data);
        const response = await fetch(`${BASE_URL}/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log("Register API response:", response.status, result);
        saveBackendAuth(result);
      } catch (err) {
        console.log("API failed, using local data", err);
      }
    })();

    return {
      ok: true,
      message: "Registration successful. Please log in with your new account."
    };
  };

  const logoutUser = () => {
    clearBackendCart();
    setCurrentUser(null);
    setCartItems([]);
  };

  const placeOrder = () => {
    if (!currentUser) {
      return {
        ok: false,
        message: "Please register and log in before placing an order."
      };
    }

    if (!cartItems.length) {
      return {
        ok: false,
        message: "Your cart is empty."
      };
    }

    const orderTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const orderItems = cartItems.map((item) => `${item.name} x${item.quantity}`).join(", ");

    const newOrder = {
      id: `#FD${Date.now().toString().slice(-5)}`,
      userId: currentUser.id,
      customer: currentUser.name,
      item: orderItems,
      total: orderTotal,
      status: "Placed"
    };

    const updatedUser = {
      ...currentUser,
      orders: currentUser.orders + 1,
      points: currentUser.points + Math.round(orderTotal / 10)
    };

    setOrders((currentOrders) => [newOrder, ...currentOrders]);
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === currentUser.id ? updatedUser : user))
    );
    setCurrentUser(updatedUser);

    console.log("Sending order to backend:", {
      userId: currentUser.id,
      items: cartItems,
      total: orderTotal,
      status: "Placed"
    });

    (async () => {
      try {
        const response = await fetch(`${BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            userId: currentUser.id,
            items: cartItems,
            total: orderTotal,
            status: "Placed"
          })
        });
        console.log("Order API response status:", response.status);
        const data = await response.json();
        console.log("Order API success:", data);
      } catch (err) {
        console.log("API failed, using local data", err);
      }
    })();

    clearBackendCart();
    setCartItems([]);

    return {
      ok: true,
      message: "Order placed successfully."
    };
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const currentUserOrders = currentUser
    ? orders.filter((order) => order.userId === currentUser.id)
    : [];

  return (
    <BrowserRouter>
      <div className="site-shell">
        <AdminSessionWatcher />
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          cartCount={cartCount}
          currentUser={currentUser}
          onLogout={logoutUser}
        />
        <Routes>
          <Route
            path="/"
            element={<Home featuredItems={menuItems.slice(0, 3)} onAddToCart={addToCart} />}
          />
          <Route
            path="/menu"
            element={
              <Menu
                items={filteredItems}
                onAddToCart={addToCart}
                searchTerm={searchTerm}
                onRefreshFoods={fetchFoods}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <Cart
                cartItems={cartItems}
                cartTotal={cartTotal}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                currentUser={currentUser}
                onPlaceOrder={placeOrder}
              />
            }
          />
          <Route path="/login" element={<Login onLogin={loginUser} />} />
          <Route path="/register" element={<Register onRegister={registerUser} />} />
          <Route
            path="/profile"
            element={<Profile currentUser={currentUser} userOrders={currentUserOrders} />}
          />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard
                  itemCount={menuItems.length}
                  orderCount={orders.length}
                  userCount={users.length}
                />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/add-food"
            element={
              <ProtectedAdminRoute>
                <AddFood onAddFood={addFoodItem} />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/edit-food"
            element={
              <ProtectedAdminRoute>
                <EditFood />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/edit-food/:id"
            element={
              <ProtectedAdminRoute>
                <EditFood />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/delete-food"
            element={
              <ProtectedAdminRoute>
                <DeleteFood onFoodDeleted={removeFoodItem} />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <ManageOrders />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <Users />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
