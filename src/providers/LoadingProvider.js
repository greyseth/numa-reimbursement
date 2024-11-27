import { createContext, useState } from "react";

export const LoadingContext = createContext();

function LoadingProvider({ children }) {
  const [loading, setLoading] = useState({
    loading: false,
    error: false,
    complete: false,
  });

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export default LoadingProvider;
