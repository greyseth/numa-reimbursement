import { useContext } from "react";
import LoginChecker from "./components/passive/LoginChecker";
import { LoadingContext } from "./providers/LoadingProvider";
import GlobalLoading from "./components/global/global_Loading";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <>
      <LoginChecker />

      <Sidebar />
      <p className="text-yellow-500">Hello, world</p>
    </>
  );
}

export default App;
