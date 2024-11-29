import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { LoginContext } from "../providers/LoginProvider";
import { MessageContext } from "../providers/MessageProvider";

export default function Header() {
  const { loginData, setLoginData } = useContext(LoginContext);
  const { message, setMessage } = useContext(MessageContext);

  return (
    <div className="p-2 px-6 mb-4 w-full bg-contrast shadow-lg shadow-gray-300 flex justify-end">
      {loginData ? (
        <div
          className="flex justify-end items-center gap-3 cursor-help"
          onMouseEnter={() =>
            setMessage(`${loginData.email} - ${loginData.role.toUpperCase()}`)
          }
          onMouseLeave={() => setMessage("")}
        >
          <p>
            Logged in as <span className="font-bold">{loginData.username}</span>
          </p>
          <FontAwesomeIcon
            icon={faUserCircle}
            color="black"
            className="text-2xl"
          />
        </div>
      ) : null}
    </div>
  );
}
