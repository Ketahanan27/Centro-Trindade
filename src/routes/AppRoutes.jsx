import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Escola120 from "../pages/Escola120";
import Contribua from "../pages/Contribua";
import QuemSomos from "../pages/QuemSomos";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/escola120" element={<Escola120 />} />

      <Route path="/contribua" element={<Contribua />} />

      <Route path="/quem-somos" element={<QuemSomos />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;