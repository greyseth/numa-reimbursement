import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/css/index.css";
import "./assets/css/index_res.css";

import App from "./App";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Page_Auth from "./pages/Auth";
import Page_404 from "./pages/404";
import LoginProvider from "./providers/LoginProvider";
import LoadingProvider from "./providers/LoadingProvider";
import GlobalsContainer from "./components/global/GlobalContainer";
import WarningProvider from "./providers/WarningProvider";
import MobileProvider from "./providers/MobileProvider";
import Page_Reimbursement from "./pages/Reimbursement";
import Page_Dashboard from "./pages/Dashboard";
import MessageProvider from "./providers/MessageProvider";
import Page_ReimbursementForm from "./pages/ReimbursementForm";
import Page_ReimbursementView from "./pages/ReimbursementView";
import Page_Admin from "./pages/Admin";
import Page_AdminForm from "./pages/AdminForm";
import Page_AdminEdit from "./pages/AdminEdit";
import Page_Testing from "./pages/TestPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Outlet />,
        children: [
          {
            path: "/",
            element: <Page_Dashboard />,
          },
          {
            path: "/request",
            element: <Page_Reimbursement />,
          },
          {
            path: "/request/new",
            element: <Page_ReimbursementForm />,
          },
          {
            path: "/request/view/:id_request",
            element: <Page_ReimbursementView />,
          },
          {
            path: "/admin",
            element: <Page_Admin />,
          },
          {
            path: "/admin/add",
            element: <Page_AdminForm />,
          },
          {
            path: "/admin/edit/:id_user",
            element: <Page_AdminEdit />,
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: <Page_Auth />,
  },
  {
    path: "/testing",
    element: <Page_Testing />,
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
            <MessageProvider>
              <RouterProvider router={router} />

              <GlobalsContainer />
            </MessageProvider>
          </LoginProvider>
        </MobileProvider>
      </WarningProvider>
    </LoadingProvider>
  </React.StrictMode>
);
