import { StrictMode, startTransition } from "react";
import { createRoot } from "react-dom/client";
import { SupabaseProvider } from "./context/SupabaseProvider";
import App from "./App.tsx";
import "./index.css";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

const root = createRoot(document.getElementById("root")!);

startTransition(() => {
  root.render(
    <StrictMode>
      <SupabaseProvider>
        <App />
        <SpeedInsights />
        <Analytics />
      </SupabaseProvider>
    </StrictMode>
  );
});
