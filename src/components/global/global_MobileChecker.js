import { useContext, useEffect } from "react";
import { MobileContext } from "../../providers/MobileProvider";

export default function GlobalMobileChecker() {
  const { isMobile, setIsMobile } = useContext(MobileContext);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
}
