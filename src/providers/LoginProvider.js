import { createContext, useState } from "react";

export const LoginContext = createContext();

function LoginProvider({ children }) {
  const [loginData, setLoginData] = useState(undefined);

  return (
    <LoginContext.Provider value={{ loginData, setLoginData }}>
      {children}
    </LoginContext.Provider>
  );
}

export default LoginProvider;
