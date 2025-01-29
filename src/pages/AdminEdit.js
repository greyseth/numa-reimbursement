import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../providers/LoadingProvider";
import { WarningContext } from "../providers/WarningProvider";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackward,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import request from "../util/API";
import LoadingError from "../components/LoadingError";
import LoadingSpinner from "../components/LoadingSpinner";
import { verifyInput } from "../util/verifyInput";

export default function Page_AdminEdit() {
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);
  const navigate = useNavigate();
  let { id_user } = useParams();

  const [input, setInput] = useState({});
  const [roles, setRoles] = useState([]);
  const [userLoading, setUserLoading] = useState({});

  const [passwordVisible, setPasswordVisible] = useState(false);

  async function fetchRoles() {
    const response = await request("GET", "/users/roles");
    if (response.error) return alert("Failed to fetch roles");

    setRoles(response);
  }

  async function fetchUser() {
    setUserLoading({});

    const response = await request("GET", "/users/" + id_user);
    if (response) {
      if (response.error) return setUserLoading({ error: true });
      setInput(response);
    } else return setUserLoading({ notfound: true });

    setUserLoading(undefined);
  }

  useEffect(() => {
    fetchUser();
    fetchRoles();
  }, []);

  async function handleUpdate() {
    const verified = verifyInput(
      {
        username: input.username,
        email: input.email,
        id_role: input.id_role,
        nik: input.nik,
      },
      (param) =>
        setWarning({
          headerMessage: "Cannot Update",
          message: `The field ${param} cannot be empty`,
          singleConfirm: true,
        })
    );
    if (verified) {
      setLoading({ loading: true });

      const response = await request("PUT", "/users/" + id_user, input);
      if (response && response.error)
        return setLoading({
          loading: true,
          error: true,
          message:
            response.error.details.error.errno === 1062
              ? "Email already set to a different user"
              : undefined,
        });

      setLoading({
        loading: true,
        complete: true,
        message: "Successfully updated user data",
      });
    }
  }

  async function handleDelete() {
    setLoading({ loading: true });

    const response = await request(
      "PUT",
      `/users/${id_user}/active/${input.active ? "0" : "1"}`
    );
    if (response && response.error)
      return setLoading({ loading: true, error: true });

    setLoading({
      loading: true,
      complete: true,
      message: "User active status has been updated",
      onComplete: () => navigate("/admin"),
    });
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-xl">
          Update Account Id {id_user} {!input.active ? "(INACTIVE)" : ""}
        </h1>
        <button
          className="btn primary md:space-x-1"
          onClick={() => navigate("/admin")}
        >
          <span className="hidden md:inline">Back</span>{" "}
          <FontAwesomeIcon icon={faBackward} color="white" />
        </button>
      </div>

      {userLoading ? (
        userLoading.error ? (
          <LoadingError onRetry={fetchUser} />
        ) : userLoading.notfound ? (
          <h1 className="font-bold italic text-xl w-full text-center">
            User with id {id_user} was not found
          </h1>
        ) : (
          <LoadingSpinner />
        )
      ) : (
        <>
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

          <label className="form-label">
            Change Password (leave empty to retain existing password)
          </label>
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

          <button className="btn primary full mb-4" onClick={handleUpdate}>
            Update Account
          </button>
          <button
            className="btn red full"
            onClick={() =>
              setWarning({
                headerMessage: "Confirm Process",
                message: input.active
                  ? "Are you sure you want to deactivate this account? User won't be able to log in using this account"
                  : "Are you sure you want to reactivate this account? User will regain access",
                confirmAction: handleDelete,
                confirmDanger: true,
              })
            }
          >
            {input.active ? "Deactivate Account" : "Activate Account"}
          </button>
        </>
      )}
    </>
  );
}
