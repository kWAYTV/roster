import React from "react";
import { createRoot } from "react-dom/client";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { App } from "./app";
import "./index.css";
import "./theme/tokens.css";
import "./theme/globals.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element is missing from index.html");
}

createRoot(container).render(
  <React.StrictMode>
    <TooltipProvider delay={400}>
      <App />
      <Toaster position="bottom-right" richColors closeButton />
    </TooltipProvider>
  </React.StrictMode>,
);
