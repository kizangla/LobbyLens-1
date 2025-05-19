import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Disable pinch zoom for better touch experience on large displays
document.addEventListener('touchmove', function (event) {
  if (event.scale !== 1) { event.preventDefault(); }
}, { passive: false });

// Create React root and render app
createRoot(document.getElementById("root")!).render(<App />);
