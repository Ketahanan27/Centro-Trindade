import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./assets/styles/index.css";

import "./features/publico/styles/gallery.css";
import "./features/publico/styles/hero.css";
import "./features/publico/styles/videosection.css";
import "./assets/styles/home/Footer.css";
import "./assets/styles/home/Navbar.css";
import "./features/publico/styles/formulario.css";
import "./features/publico/styles/contribua.css";
import "./features/publico/styles/calendario.css";
import "remixicon/fonts/remixicon.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
