import React from "react";
import { createRoot } from "react-dom/client";

import { Toaster } from "@/ui/primitives/sonner";
import { TooltipProvider } from "@/ui/primitives/tooltip";
import { App } from "./shell/app";
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
      <Toaster closeButton position="bottom-right" richColors />
    </TooltipProvider>
  </React.StrictMode>
);
