import { createRoot } from "react-dom/client";

import App from "@/app";
import AppProvider from "@/app/provider";
import "@/styles/global.css";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <AppProvider>
    <App />
  </AppProvider>,
  // </StrictMode>,
);
