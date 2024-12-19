import {
  faAdd,
  faLeftLong,
  faReceipt,
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
import LoadingError from "../components/LoadingError";
import request from "../util/API";
import formatPrice from "../util/priceFormatter";
import formatDate from "../util/dateFormatter";

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
    error: true,
  });
  const [reimbursements, setReimbursements] = useState([]);

  async function fetchData() {
    setReimbursementsLoading({ loading: true, error: false });

    const response = await request("POST", "/requests/search/" + page, search);
    if (response.error)
      return setReimbursementsLoading({ loading: true, error: true });

    setReimbursements(response);
    setReimbursementsLoading({ loading: false, error: false });
  }

  useEffect(() => {
    fetchData();
  }, [search, page]);

  return (
    <>
      {/* Page header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold w-3/4 text-md md:text-xl">
          Reimbursement Request Management
        </h2>
        {loginData && loginData.role === "user" ? (
          <button
            className="btn primary md:space-x-1"
            onClick={() => navigate("/reimbursement/new")}
          >
            <span className="hidden md:inline">Add</span>{" "}
            <FontAwesomeIcon icon={faAdd} color="white" />
          </button>
        ) : (
          <button className="btn primary md:space-x-1" onClick={() => {}}>
            <span className="hidden md:inline">Export</span>{" "}
            <FontAwesomeIcon icon={faReceipt} color="white" />
          </button>
        )}
      </div>

      {/* Search and filters */}
      <SearchBar
        placeholder={"Search by name or description..."}
        onSearch={(searchInput) =>
          setSearch({ ...search, search: searchInput })
        }
      />
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
            <LoadingError onRetry={fetchData} />
          ) : (
            <LoadingSpinner />
          )
        ) : (
          <>
            {reimbursements.length > 0 ? (
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
                  {reimbursements.map((r) => (
                    <tr
                      key={r.id_request}
                      className="text-center border-y-2 cursor-pointer"
                      onClick={() =>
                        navigate(`/reimbursement/view/${r.id_request}`)
                      }
                    >
                      <td>
                        REQUEST_R{r.id_request.toString().padStart(4, "0")}
                      </td>
                      <td className="min-w-72">{r.title}</td>
                      <td className="min-w-32">{r.username}</td>
                      <td className="min-w-32">{formatPrice(r.total_price)}</td>
                      <td className="min-w-32">{formatDate(r.date_created)}</td>
                      <td className="min-w-32 p-2">
                        <p
                          className={`p-2 font-bold ${
                            r.status === "pending"
                              ? "bg-yellow-500"
                              : r.status === "approved"
                              ? "bg-blue-500"
                              : r.status === "paid"
                              ? "bg-green-500"
                              : "bg-red-600"
                          } text-white rounded-full`}
                        >
                          {r.status.toUpperCase()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="w-full text-center font-bold">No Requests Found</p>
            )}

            {/* Pagination controls */}
            <p className="w-full text-center font-bold mt-8 mb-2">
              Viewing Page
            </p>
            <div className="flex items-center justify-center mb-6">
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
        )}
      </div>
    </>
  );
}
