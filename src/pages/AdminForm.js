import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../providers/LoadingProvider";
import { WarningContext } from "../providers/WarningProvider";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackward,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import request from "../util/API";
import { verifyInput } from "../util/verifyInput";

export default function Page_AdminForm() {
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);
  const navigate = useNavigate();

  const [input, setInput] = useState({ id_role: 1 });
  const [roles, setRoles] = useState([]);

  const [passwordVisible, setPasswordVisible] = useState(false);

  async function fetchRoles() {
    const response = await request("GET", "/users/roles");
    if (response.error) return alert("Failed to fetch roles");

    setRoles(response);
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  async function handleAdd() {
    const verified = verifyInput(
      {
        username: input.username,
        email: input.email,
        nik: input.nik,
        id_role: input.id_role,
        password: input.password,
      },
      () =>
        setWarning({
          headerMessage: "Cannot submit",
          message: "All fields must be filled",
          singleConfirm: true,
        })
    );
    if (verified) {
      setLoading({ loading: true, error: false, complete: false });

      const response = await request("POST", "/users/auth/register", input);
      if (response && response.error)
        return setLoading({
          loading: true,
          error: true,
          message:
            response.error.details.error.errno === 1062
              ? "Email already registered"
              : undefined,
        });

      setLoading({
        loading: true,
        complete: true,
        message: "Registered new user",
      });
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-xl">Add New Account</h1>
        <button
          className="btn primary md:space-x-1"
          onClick={() => navigate("/admin")}
        >
          <span className="hidden md:inline">Back</span>{" "}
          <FontAwesomeIcon icon={faBackward} color="white" />
        </button>
      </div>

      <label className="form-label">Account Username</label>
      <input
        type="text"
        className="form-input mb-4"
        value={input.username}
        onChange={(e) => setInput({ ...input, username: e.target.value })}
      />

      <label className="form-label">Email Address</label>
      <input
        type="text"
        className="form-input mb-4"
        value={input.email}
        onChange={(e) => setInput({ ...input, email: e.target.value })}
      />

      <label className="form-label">User NIK</label>
      <input
        type="text"
        className="form-input mb-4"
        value={input.nik}
        onChange={(e) => setInput({ ...input, nik: e.target.value })}
      />

      <label className="form-label">User Role</label>
      <select
        className="form-input mb-4"
        value={input.id_role}
        onChange={(e) => setInput({ ...input, id_role: e.target.value })}
      >
        {roles.length < 1 ? (
          <option value={""} key={0}>
            Loading roles...
          </option>
        ) : (
          roles.map((r) => (
            <option value={r.id_role} key={r.id_role}>
              {r.role_name}
            </option>
          ))
        )}
      </select>

      <label className="form-label">PASSWORD</label>
      <div className="relative">
        <input
          type={passwordVisible ? "text" : "password"}
          className="form-input mb-4"
          value={input.password}
          onChange={(e) => setInput({ ...input, password: e.target.value })}
        />
        <div
          className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
          onClick={() => setPasswordVisible(!passwordVisible)}
        >
          <FontAwesomeIcon
            icon={passwordVisible ? faEye : faEyeSlash}
            size="1x"
            color="black"
          />
        </div>
      </div>

      <button className="btn primary full" onClick={handleAdd}>
        Add User Account
      </button>
    </>
  );
}
