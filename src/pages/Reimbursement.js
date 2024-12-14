import {
  faAdd,
  faLeftLong,
  faRightLong,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SearchBar from "../components/SearchBar";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "../providers/LoginProvider";
import { LoadingContext } from "../providers/LoadingProvider";
import { WarningContext } from "../providers/WarningProvider";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Page_Reimbursement() {
  const { warning, setWarning } = useContext(WarningContext);
  const { loading, setLoading } = useContext(LoadingContext);
  const { loginData, setLoginData } = useContext(LoginContext);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [search, setSearch] = useState({
    search: "",
    days: undefined,
    orderBy: undefined,
  });
  const [page, setPage] = useState(queryParams.get("page") ?? 1);

  const [reimbursementsLoading, setReimbursementsLoading] = useState({
    loading: true,
    error: false,
  });
  const [reimbursements, setReimbursements] = useState([]);

  async function fetchData() {}

  useEffect(() => {
    fetchData();
  }, [search]);

  return (
    <>
      {/* Page header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold w-3/4 text-md md:text-xl">
          Reimbursement Request Management
        </h2>
        <button
          className="btn primary md:space-x-1"
          onClick={() => navigate("/reimbursement/new")}
        >
          <span className="hidden md:inline">Add</span>{" "}
          <FontAwesomeIcon icon={faAdd} color="white" />
        </button>
      </div>

      {/* Search and filters */}
      <SearchBar placeholder={"Search by name or description..."} />
      <div className="space-x-2 mt-2 mb-6">
        <select
          className="dropdown"
          value={search.days}
          onChange={(e) => setSearch({ ...search, days: e.target.value })}
        >
          <option value={""}>All Days</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={365}>Last 365 days</option>
        </select>
        <select
          className="dropdown"
          value={search.orderBy}
          onChange={(e) => setSearch({ ...search, orderBy: e.target.value })}
        >
          <option value={"DESC"}>Newest</option>
          <option value={"ASC"}>Oldest</option>
        </select>
      </div>

      <div className="w-full bg-gray-300 h-[1px] mb-4"></div>

      {/* Reimbursements list */}
      <div className="w-full max-h-[600px] overflow-auto">
        {reimbursementsLoading.loading ? (
          reimbursementsLoading.error ? (
            <></>
          ) : (
            <LoadingSpinner />
          )
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-secondary">
                <tr>
                  <th>Request ID</th>
                  <th>Request Title</th>
                  <th>Uploader</th>
                  <th>Total Price</th>
                  <th>Request Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className="text-center border-y-2 cursor-pointer"
                  onClick={() => {}}
                >
                  <td>001</td>
                  <td className="min-w-72">This is a request</td>
                  <td className="min-w-32">Grey</td>
                  <td className="min-w-32">Rp. 1,000,000</td>
                  <td className="min-w-32">00/00/0000</td>
                  <td className="min-w-32 p-2">
                    <p className="p-2 font-bold bg-yellow-500 text-white rounded-full">
                      PENDING
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Pagination controls */}
            {reimbursements.length > 0 ? (
              <>
                <p className="w-full text-center font-bold mt-8 mb-2">
                  Viewing Page
                </p>
                <div className="flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faLeftLong}
                    color="blue"
                    className="cursor-pointer"
                    onClick={() => {
                      if (page <= 1) return;
                      setPage((prevPage) => prevPage - 1);
                      navigate("/reimbursement?page=" + (page - 1));
                    }}
                  />
                  <input
                    type="number"
                    value={page}
                    onChange={(e) => setPage(parseInt(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape")
                        navigate("/reimbursement?page=" + page);
                    }}
                    onBlur={(e) => {
                      if (page < 0) setPage(1);

                      navigate("/reimbursement?page=" + page);
                    }}
                    className="w-8 text-center outline-none"
                  />
                  <FontAwesomeIcon
                    icon={faRightLong}
                    color="blue"
                    className="cursor-pointer"
                    onClick={() => {
                      setPage((prevPage) => prevPage + 1);
                      navigate("/reimbursement?page=" + (page + 1));
                    }}
                  />
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
