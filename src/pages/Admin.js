import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import request from "../util/API";
import LoadingError from "../components/LoadingError";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Page_Admin() {
  const navigate = useNavigate();

  const [userLoading, setUserLoading] = useState({});
  const [users, setUsers] = useState([]);

  async function fetchUsers() {
    setUserLoading({});

    const response = await request("GET", "/users/all");
    if (response.error) return setUserLoading({ error: true });

    setUsers(response);
    setUserLoading(undefined);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-xl">User Account Management</h1>
        <button
          className="btn primary md:space-x-1"
          onClick={() => navigate("/admin/add")}
        >
          <span className="hidden md:inline">Add User</span>{" "}
          <FontAwesomeIcon icon={faAdd} color="white" />
        </button>
      </div>

      {userLoading ? (
        userLoading.error ? (
          <LoadingError onRetry={fetchUsers} />
        ) : (
          <LoadingSpinner />
        )
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-secondary">
              <tr>
                <th>ID User</th>
                <th>Username</th>
                <th>Email</th>
                <th>NIK</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id_user}
                  className="text-center border-y-2 cursor-pointer"
                  onClick={() => navigate("/admin/edit/" + u.id_user)}
                >
                  <td>{u.id_user}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.nik}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
