import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";
import { ToastProvider } from "./feedback/toast";
import "./theme/tokens.css";
import "./theme/globals.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element is missing from index.html");
}

createRoot(container).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
);
