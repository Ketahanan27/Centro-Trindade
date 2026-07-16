import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./assets/styles/index.css";

import "./assets/styles/home/gallery.css";
import "./assets/styles/home/hero.css";
import "./assets/styles/home/videosection.css";
import "./assets/styles/home/Footer.css";
import "./assets/styles/home/Navbar.css";
import "./assets/styles/home/formulario.css";
import "./assets/styles/home/contribua.css";
import "./assets/styles/home/calendario.css";
import "remixicon/fonts/remixicon.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
