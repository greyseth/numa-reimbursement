import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/LoginProvider";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../providers/LoadingProvider";
import request from "../../util/API";

export default function LoginChecker() {
  const { loginData, setLoginData } = useContext(LoginContext);
  const { loading, setLoading } = useContext(LoadingContext);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkLogin() {
      if (!loginData) {
        if (!window.localStorage.getItem("auth_token")) navigate("/auth");
        else {
          setLoading({ loading: true, error: false, complete: false });

          const response = await request("GET", "/users/self");
          if (!response.error) {
            setLoginData(response);
            setLoading({ loading: false, error: false, complete: false });
          } else {
            setLoading({
              loading: false,
              error: false,
              complete: false,
              message: "Failed to authenticate user",
            });
            navigate("/auth");
          }
        }
      }
    }

    checkLogin();
  }, []);
}
