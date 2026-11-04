import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import "./hardware.css";
import "./components/BoardQuest.css";
import "./compact.css";
import "./output-signals.css";
import "./barbie.css";
import "./tutorial.css";
import "./controls.css";
import "./components/ChipBoard3D.css";
import "./responsive.css";
