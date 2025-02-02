import { useContext, useEffect, useRef } from "react";
import { LoginContext } from "../../providers/LoginProvider";
import { useNavigate } from "react-router-dom";

export default function AutomaticLogout() {
  const { loginData, setLoginData } = useContext(LoginContext);
  const navigate = useNavigate();

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (loginData) {
      const handleTimeout = () => {
        alert("Timed out due to inactivity!");
        navigate("/auth");
        setLoginData(undefined);
      };
      const timeoutTime = 300000;

      const resetTimer = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(handleTimeout, timeoutTime);
      };

      resetTimer(); // Start the timer initially

      document.body.addEventListener("click", resetTimer);

      return () => {
        document.body.removeEventListener("click", resetTimer);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [loginData]);
}
