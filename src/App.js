import { useContext } from "react";
import LoginChecker from "./components/passive/LoginChecker";
import { LoadingContext } from "./providers/LoadingProvider";
import GlobalLoading from "./components/global/global_Loading";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import InfoHover from "./components/InfoHover";
import AutomaticLogout from "./components/passive/AutomaticLogout";

function App() {
  return (
    <>
      <LoginChecker />
      <AutomaticLogout />

      <div className="app-container">
        <Sidebar />
        <div className="app-content">
          <Header />
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
