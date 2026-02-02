import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Laporan from "./pages/Laporan";
import Lokasi from "./pages/Lokasi";
import Aset from "./pages/Aset";
import User from "./pages/User";

function App() {
  const user = JSON.parse(localStorage.getItem("user")) || { role: "Administrator" };

  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Login */}
        <Route path="/" element={<Login />} />

        {/* Halaman setelah login */}
        <Route element={<DashboardLayout role={user.role} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user" element={<User />} />
          <Route path="/aset" element={<Aset />} /> 
          <Route path="/lokasi" element={<Lokasi />} />
          <Route path="/laporan" element={<Laporan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
