import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./assets/styles/index.css";
import "./../src/assets/styles/home/gallery.css";
import "./../src/assets/styles/home/hero.css";
import "./../src/assets/styles/home/videosection.css";
import "./../src/assets/styles/home/Footer.css";
import "./../src/assets/styles/home/Navbar.css";
import "./../src/assets/styles/home/formulario.css";
import "./../src/assets/styles/home/contribua.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);