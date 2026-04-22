import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./admin/AdminDashboard";
import AddFood from "./admin/AddFood";
import ManageOrders from "./admin/ManageOrders";
import Users from "./admin/Users";

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
  const [menuItems, setMenuItems] = useState(() => {
    const savedMenu = localStorage.getItem("fooddash-menu");
    return savedMenu ? JSON.parse(savedMenu) : starterMenu;
  });
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

  useEffect(() => {
    document.title = "Food Ordering System";
  }, []);

  useEffect(() => {
    localStorage.setItem("fooddash-menu", JSON.stringify(menuItems));
  }, [menuItems]);

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

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const increaseQuantity = (id) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const addFoodItem = (newItem) => {
    setMenuItems((currentItems) => [{ ...newItem, id: Date.now() }, ...currentItems]);
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

    return {
      ok: true,
      message: "Registration successful. Please log in with your new account."
    };
  };

  const logoutUser = () => {
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
            element={<Menu items={filteredItems} onAddToCart={addToCart} searchTerm={searchTerm} />}
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
          <Route
            path="/admin"
            element={
              <AdminDashboard
                itemCount={menuItems.length}
                orderCount={orders.length}
                userCount={users.length}
              />
            }
          />
          <Route path="/admin/add-food" element={<AddFood onAddFood={addFoodItem} />} />
          <Route path="/admin/manage-orders" element={<ManageOrders orders={orders} />} />
          <Route path="/admin/users" element={<Users users={users} orders={orders} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
