import { Routes, Route, Navigate } from "react-router";
import Signup from "./components/Signup.tsx";
import Otp from "./components/Otp.tsx";
import RestaurantHome from "./components/RestaurantHome.tsx";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/restaurant" element={<RestaurantHome />} />
        
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </>
  );
}

export default App;
