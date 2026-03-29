import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FamilyQuestBoard from "../quest.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FamilyQuestBoard />
  </StrictMode>
);
