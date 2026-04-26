import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Laporan from "./pages/Laporan";
import Penilaian from "./pages/Penilaian";
import Lokasi from "./pages/Lokasi";
import Aset from "./pages/Aset";
import User from "./pages/User";
import Pemeliharaan from "./pages/Pemeliharaan";

function App() {
  const user = JSON.parse(localStorage.getItem("user")) || { role: "Administrator" };

  return (
    <ToastProvider>
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
            <Route path="/pemeliharaan" element={<Pemeliharaan />} />
            <Route path="/penilaian" element={<Penilaian />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

