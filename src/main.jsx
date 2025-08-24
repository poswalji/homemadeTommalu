import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <GoogleOAuthProvider clientId="173521595479-e0ne73jdjhirdvgnitimlrn468k2i81f.apps.googleusercontent.com">
      <App />

    </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
