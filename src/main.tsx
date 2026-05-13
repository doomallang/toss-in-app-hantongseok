import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ColorBlindProvider } from "./contexts/ColorBlindContext.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ColorBlindProvider>
        <App />
      </ColorBlindProvider>
    </ErrorBoundary>
  </StrictMode>,
);
