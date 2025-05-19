import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Disable pinch zoom for better touch experience on large displays
document.addEventListener('touchmove', function (event: TouchEvent) {
  // TypeScript doesn't recognize scale property on TouchEvent, so we need to use any
  if ((event as any).scale !== 1) { event.preventDefault(); }
}, { passive: false });

// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Create React root and render app
createRoot(document.getElementById("root")!).render(<App />);
