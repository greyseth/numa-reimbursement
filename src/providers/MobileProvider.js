import { createContext, useState } from "react";

export const MobileContext = createContext();

function MobileProvider({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  return (
    <MobileContext.Provider value={{ isMobile, setIsMobile }}>
      {children}
    </MobileContext.Provider>
  );
}

export default MobileProvider;
