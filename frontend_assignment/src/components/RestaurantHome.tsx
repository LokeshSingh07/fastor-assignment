import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";

const API_URL = "https://staging.fastor.ai/v1/m/restaurant?city_id=118";

const BEST_SELLERS = [
  { name: "Chicken", price: "₹103.0", image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=400&q=80" },
  { name: "Curry", price: "₹50.0", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80" },
  { name: "Sandwich", price: "₹12.99", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80" },
  { name: "Dessert", price: "₹8.20", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80" },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";

const getImage = (r) => (r.logo && r.logo !== "null" ? r.logo : FALLBACK_IMAGE);

const setFallback = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMAGE;
};

const DISHES = [
  { id: "d1", name: "Farmhouse Pizza", price: 299, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80", description: "Crisp crust loaded with mushrooms, bell peppers and mozzarella." },
  { id: "d2", name: "Creamy Alfredo Pasta", price: 249, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80", description: "Penne pasta in a creamy parmesan garlic sauce." },
  { id: "d3", name: "Smoky Chicken Burger", price: 199, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", description: "Grilled patty with cheddar, pickles and house sauce." },
  { id: "d4", name: "Strawberry Shake", price: 149, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80", description: "Thick strawberry milkshake with whipped cream." },
];

const PORTIONS = [
  ["Personal (4 Slices)", 0],
  ["Medium (8 Slices)", 50],
  ["Large (10 Slices)", 100],
  ["Party Size (12 Slices)", 150],
];



export default function RestaurantHome() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = state?.token || localStorage.getItem("fastor_token");

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [dish, setDish] = useState(null);

  const user = JSON.parse(localStorage.getItem("fastor_user") || "{}");

  // load restaurants data
  useEffect(() => {
    if (!token) {
      navigate("/signup", { replace: true });
      return;
    }

    async function load() {
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load restaurants");

        const list = json.data?.results || json.data?.restaurants || json.data;
        setRestaurants(
          Array.isArray(list) ? list.map((r) => ({ ...r, image: getImage(r) })) : []
        );
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, navigate]);

  const logout = () => {
    localStorage.removeItem("fastor_token");
    localStorage.removeItem("fastor_user");
    toast.success("Logout successful!");
    navigate("/signup", { replace: true });
  };



  // CONDITIONAL RENDERING
  if (dish) {
    return (
      <DishDetails
        dish={dish}
        onBack={() => setDish(null)}
        onAdd={() => {
          toast.success(`${dish.name} added to cart`);
          setDish(null);
        }}
      />
    );
  }

  if (restaurant) {
    return (
      <RestaurantDetails
        restaurant={restaurant}
        onBack={() => setRestaurant(null)}
        onSelectDish={setDish}
        onBook={() => toast.success(`Table booked at ${restaurant.restaurant_name}`)}
      />
    );
  }

  return (
    <Home
      userName={user.user_name || "Karan"}
      restaurants={restaurants}
      loading={loading}
      error={error}
      onSelectRestaurant={setRestaurant}
      onSelectDish={setDish}
      onLogout={logout}
    />
  );
}

function Layout({ children }) {
  return (
    <div className="flex min-h-screen justify-center bg-slate-50">
      <div className="w-full max-w-lg bg-white pb-10">{children}</div>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#ff5108] hover:bg-orange-50"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

// main page
function Home({ userName, restaurants, loading, error, onSelectRestaurant, onSelectDish, onLogout }) {
  const [search, setSearch] = useState("");

  const q = search.toLowerCase().trim();
  const visible = restaurants.filter((r) =>
    `${r.restaurant_name} ${r.address_complete}`.toLowerCase().includes(q)
  );

  return (
    <Layout>
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-400">Current Location</p>
          <strong className="text-sm text-slate-800">Connaught Place, New Delhi</strong>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg border border-[#ff5108] px-3 py-1 text-xs font-semibold text-[#ff5108]"
        >
          Log out
        </button>
      </header>

      <div className="flex items-center gap-2.5 px-5 pt-4">
        <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800">
          Hi, {userName}
        </div>
        <button
          onClick={() => toast("No active orders")}
          className="h-10 w-10 rounded-xl bg-[#ff8068] text-white"
        >
          ♨
        </button>
        <button
          onClick={() => toast("Wallet balance: ₹0",)}
          className="h-10 w-10 rounded-xl bg-[#4e87dc] text-white"
        >
          ▣
        </button>
      </div>

      <div className="px-5 pt-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search restaurants"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#ff5108]"
        />
      </div>

      {/* best seller */}
      <section className="px-5 pt-5">
        <h2 className="mb-2.5 text-sm font-bold text-slate-800">Best Seller</h2>
        <div className="grid grid-cols-4 gap-2">
          {BEST_SELLERS.map((item) => (
            <button
              key={item.name}
              onClick={() =>
                onSelectDish({
                  name: item.name,
                  price: 99,
                  image: item.image,
                  description: `Fresh ${item.name} made with authentic ingredients.`,
                })
              }
              className="relative h-20 overflow-hidden rounded-xl bg-slate-100"
            >
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              <span className="absolute bottom-0 right-0 rounded-tl-md bg-[#ff5108] px-1.5 py-0.5 text-[9px] font-bold text-white">
                {item.price}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="relative mx-5 mt-4 flex h-24 overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff5108] to-[#ff7a45] text-white">
        <div className="z-10 flex w-3/5 flex-col justify-center pl-4">
          <span className="text-[11px] leading-tight">
            Experience our
            <br />
            delicious new dish
          </span>
          <strong className="text-2xl font-extrabold">30% OFF</strong>
        </div>
        <img
          src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"
          alt="Special offer"
          className="absolute right-0 top-0 h-full w-2/5 object-cover"
        />
      </div>

      {/* popular restaurants */}
      <section className="px-5 pt-5">
        <h2 className="text-base font-bold text-slate-800">Popular Restaurants</h2>

        {loading && <p className="mt-3 text-sm text-slate-500">Loading...</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {!loading && !error && visible.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">No restaurants found.</p>
        )}

        <div className="mt-3 flex flex-col gap-3">
          {visible.map((r, i) => (
            <button
              key={r.restaurant_id || i}
              onClick={() => onSelectRestaurant(r)}
              className="flex items-center gap-3.5 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-orange-200 hover:shadow-md"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={r.image}
                  alt={r.restaurant_name}
                  onError={setFallback}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-slate-800">{r.restaurant_name}</h3>
                {r.address_complete && r.address_complete !== "null" && (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{r.address_complete}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
    </Layout>
  );
}

// restaurant details page
function RestaurantDetails({ restaurant, onBack, onSelectDish, onBook }) {
  const address =
    restaurant.address_complete !== "null" ? restaurant.address_complete : "";

  return (
    <Layout>
      <div className="relative h-48 bg-slate-200">
        <img
          src={restaurant.image}
          alt={restaurant.restaurant_name}
          onError={setFallback}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90">
          <BackButton onClick={onBack} />
        </div>
      </div>

      <div className="px-5 pt-4">
        <h1 className="text-xl font-bold text-slate-800">{restaurant.restaurant_name}</h1>
        {address && <p className="mt-1 text-xs text-slate-500">{address}</p>}

        <h2 className="mb-3 mt-6 text-base font-bold text-slate-800">Menu</h2>
        <div className="flex flex-col gap-3">
          {DISHES.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDish(d)}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-left hover:border-orange-200"
            >
              <img src={d.image} alt={d.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-slate-800">{d.name}</h4>
                <p className="line-clamp-1 text-[11px] text-slate-500">{d.description}</p>
                <p className="mt-1 text-xs font-bold text-[#ff5108]">₹{d.price}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onBook}
          className="mt-8 w-full rounded-xl bg-[#ff5108] py-3 text-sm font-semibold text-white"
        >
          Book a Table
        </button>
      </div>
    </Layout>
  );
}

// dish details page
function DishDetails({ dish, onBack, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [portion, setPortion] = useState(PORTIONS[1][0]);

  const extra = PORTIONS.find(([label]) => label === portion)[1];
  const total = (Number(dish.price) + extra) * quantity;

  return (
    <Layout>
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <BackButton onClick={onBack} />
        <span className="text-sm font-bold text-slate-800">Dish Details</span>
        <div className="w-9" />
      </header>

      <div className="p-5">
        <img src={dish.image} alt={dish.name} className="h-52 w-full rounded-2xl object-cover" />

        <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <strong className="text-2xl font-extrabold text-[#ff5108]">₹{total.toFixed(2)}</strong>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-7 w-7 rounded-full bg-[#ff5108] font-bold text-white"
            >
              −
            </button>
            <span className="w-4 text-center font-bold text-slate-800">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              className="h-7 w-7 rounded-full bg-[#ff5108] font-bold text-white"
            >
              +
            </button>
          </div>
        </div>

        <h1 className="mt-4 text-xl font-bold text-slate-800">{dish.name}</h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{dish.description}</p>

        <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">Choose portion</h3>
        <div className="flex flex-col gap-2">
          {PORTIONS.map(([label, add]) => (
            <label
              key={label}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-3 text-xs text-slate-700 hover:border-orange-200"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="portion"
                  checked={portion === label}
                  onChange={() => setPortion(label)}
                  className="accent-[#ff5108]"
                />
                {label}
              </span>
              <span className="font-semibold text-slate-900">
                ₹{(Number(dish.price) + add).toFixed(2)}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={onAdd}
          className="mt-8 w-full rounded-xl bg-[#ff5108] py-3.5 text-sm font-semibold text-white"
        >
          Add to cart - ₹{total.toFixed(2)}
        </button>
      </div>
    </Layout>
  );
}