import React from "react";
import { createRoot } from "react-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import App from "./src/App";

const theme = createTheme();

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
);
