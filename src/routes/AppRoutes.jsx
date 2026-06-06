import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Escola120 from "../pages/Escola120";
import Contribua from "../pages/Contribua";
import Formulario from "../pages/Formulario";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/escola120" element={<Escola120 />} />

      <Route path="/contribua" element={<Contribua />} />

      <Route path="/formulario" element={<Formulario />} />

      <Route path="*" element={<NotFound />} />

      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default AppRoutes;