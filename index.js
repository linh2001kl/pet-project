import React from "react";
import reactDom from "react-dom";
import App from "./src/App";
import { BrowserRouter, HashRouter } from "react-router-dom";

reactDom.render(
  //   <HashRouter>
  <App />,
  //   </HashRouter>,
  document.getElementById("root")
);
