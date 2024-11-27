import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/css/index.css";

import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Page_Auth from "./pages/Auth";
import Page_404 from "./pages/404";
import LoginProvider from "./providers/LoginProvider";
import LoadingProvider from "./providers/LoadingProvider";
import GlobalsContainer from "./components/global/GlobalContainer";
import WarningProvider from "./providers/WarningProvider";
import MobileProvider from "./providers/MobileProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/auth",
    element: <Page_Auth />,
  },
  {
    path: "*",
    element: <Page_404 />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LoadingProvider>
      <WarningProvider>
        <MobileProvider>
          <LoginProvider>
            <RouterProvider router={router} />

            <GlobalsContainer />
          </LoginProvider>
        </MobileProvider>
      </WarningProvider>
    </LoadingProvider>
  </React.StrictMode>
);
