import logo from "../assets/img/numaLogo_transparent.png";
import loginBackground from "../assets/img/loginBackground.jpg";

import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { submitOnEnter } from "../util/formEnter";
import { LoadingContext } from "../providers/LoadingProvider";
import { WarningContext } from "../providers/WarningProvider";
import { verifyInput } from "../util/verifyInput";
import request from "../util/API";
import { LoginContext } from "../providers/LoginProvider";
import { useNavigate } from "react-router-dom";

export default function Page_Auth() {
  const { loginData, setLoginData } = useContext(LoginContext);
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);
  const navigate = useNavigate();

  const [input, setInput] = useState({ email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleLogin() {
    const allFilled = verifyInput(input, () =>
      setWarning({
        message: "Email and password can't be empty!",
        singleConfirm: true,
      })
    );

    if (allFilled) {
      setLoading({ loading: true, error: false, complete: false });

      const response = await request("POST", "/users/auth/login", input);
      if (response.error)
        return setLoading({ loading: true, error: true, complete: false });

      if (response.success) {
        window.localStorage.setItem("auth_token", response.auth_token);

        setLoginData({
          id_user: response.id_user,
          username: response.username,
          email: response.email,
          phone: response.phone,
          role: response.role,
        });

        navigate("/");
      } else
        return setWarning({
          headerMessage: "Unable to login",
          message: "Invalid email/password",
          singleConfirm: true,
          confirmAction: () =>
            setLoading({ loading: false, error: false, complete: false }),
        });

      setLoading({ loading: false, error: false, complete: false });
    }
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row h-screen bg-primary text-white">
        <div className="lg:w-1/2 w-full flex flex-col justify-center px-8 lg:px-20 py-10">
          <img src={logo} />

          <h4 className="text-gray-500 text-sm mb-2">Numa Management App</h4>
          <h1 className="text-2xl lg:text-3xl font-semibold mb-2">
            Log in to your account
          </h1>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-500 mb-1"
              >
                EMAIL
              </label>
              <input
                type="email"
                id="email"
                placeholder="email@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
                value={input.email}
                onChange={(e) => setInput({ ...input, email: e.target.value })}
                onKeyDown={(e) => submitOnEnter(e, handleLogin)}
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-500 mb-1"
              >
                PASSWORD
              </label>
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                placeholder="**********"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
                value={input.password}
                onChange={(e) =>
                  setInput({ ...input, password: e.target.value })
                }
                onKeyDown={(e) => submitOnEnter(e, handleLogin)}
              />
              <div
                className="mt-5 absolute inset-y-0 right-4 flex items-center cursor-pointer"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                <FontAwesomeIcon
                  icon={passwordVisible ? faEye : faEyeSlash}
                  size="1x"
                  color="black"
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn secondary full"
              onClick={handleLogin}
            >
              LOG IN
            </button>
          </div>
        </div>

        <div className="flex w-full w-1/2 justify-end items-center">
          <div
            className="w-8/12 h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${loginBackground})`,
              backgroundPosition: "left",
            }}
          ></div>
        </div>
      </div>
    </>
  );
}
