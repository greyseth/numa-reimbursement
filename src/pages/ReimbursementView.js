import { useContext, useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import request from "../util/API";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingContext } from "../providers/LoadingProvider";
import { WarningContext } from "../providers/WarningProvider";
import LoadingError from "../components/LoadingError";
import formatPrice from "../util/priceFormatter";
import formatDate from "../util/dateFormatter";
import ItemListItem from "../components/ItemListItem";
import ImageViewer from "../components/popups/popup_ImageVIewer";
import { LoginContext } from "../providers/LoginProvider";
import ApproveItemPopup from "../components/popups/popup_ApproveItem";
import FileInput from "../components/FileInput";
import ViewApprovalPopup from "../components/popups/popup_ViewApproval";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faMailBulk,
  faMailReply,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import RequestEditDetails from "../components/popups/popup_EditRequestDetails";
import RequestEditItems from "../components/popups/popup_EditRequestItems";
import PayItemPopup from "../components/popups/popup_PayItem";

export default function Page_ReimbursementView() {
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);
  const { loginData, setLoginData } = useContext(LoginContext);
  const { id_request } = useParams();
  const navigate = useNavigate();

  const [detailsLoading, setDetailsLoading] = useState({
    loading: true,
  });
  const [details, setDetails] = useState({});

  const [viewImage, setViewImage] = useState(undefined);
  const [approveItem, setApproveItem] = useState(undefined);
  const [payItem, setPayItem] = useState(undefined);
  const [viewApproval, setViewApproval] = useState(undefined);
  const [openEdit, setOpenEdit] = useState({});

  async function fetchData() {
    const response = await request("GET", "/requests/" + id_request);
    if (response.error)
      return setDetailsLoading({ loading: true, error: true });

    setDetails(response);
    setDetailsLoading({ loading: false, error: false });
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleDelete() {
    setLoading({ loading: true });

    const response = await request("DELETE", "/requests/" + id_request);
    if (response && response.error) return setLoading({ error: true });

    setLoading({
      loading: true,
      complete: true,
      message: "Successfully deleted request",
      onComplete: () => navigate("/request"),
    });
  }

  async function handleNotify() {
    setLoading({ loading: true });

    const response = await request(
      "GET",
      "/requests/approve/notify/" + id_request
    );
    if (response && response.error) return setLoading({ error: true });

    setLoading({
      loading: true,
      complete: true,
      message: "Successfully notified requestor",
    });
  }

  return (
    <>
      {viewImage === undefined ? null : (
        <ImageViewer
          images={details.items.map(
            (i) => process.env.REACT_APP_APIHOST + "/img/" + i.image
          )}
          imageIndex={viewImage}
          setClose={setViewImage}
        />
      )}

      {payItem === undefined ? null : (
        <PayItemPopup
          id_item={payItem}
          setDetails={setDetails}
          setClose={setPayItem}
        />
      )}

      {approveItem === undefined ? null : (
        <ApproveItemPopup
          id_item={approveItem}
          setDetails={setDetails}
          setClose={setApproveItem}
        />
      )}

      {viewApproval === undefined ? null : (
        <ViewApprovalPopup approval={viewApproval} setClose={setViewApproval} />
      )}

      {openEdit.details ? (
        <RequestEditDetails
          details={details}
          setDetails={setDetails}
          setClose={setOpenEdit}
        />
      ) : null}

      {openEdit.items ? (
        <RequestEditItems
          details={details}
          setDetails={setDetails}
          setClose={setOpenEdit}
        />
      ) : null}

      {detailsLoading.loading ? (
        detailsLoading.error ? (
          <LoadingError onRetry={fetchData} />
        ) : (
          <LoadingSpinner />
        )
      ) : (
        <>
          <h2 className="font-bold w-3/4 text-md md:text-xl mb-4">
            Viewing Request {details.request.type === "petty cash" ? "PC" : "R"}
            -NMA-{formatDate(details.request.date_created)}-
            {id_request.toString().padStart(4, "0")}
            <span
              className={`bg-${
                details.request.status === "pending"
                  ? "yellow"
                  : details.request.status === "approved"
                  ? "blue"
                  : details.request.status === "paid"
                  ? "green"
                  : "red"
              }-500 p-2 ml-4 rounded-full font-bold text-white`}
            >
              {details.request.status.toUpperCase()}
            </span>
          </h2>

          {/* General Request Details */}
          <div className="bg-gray-200 border rounded-lg p-6 mb-8">
            <div className="mb-4 flex justify-start items-center gap-4">
              <h2 className="font-semibold text-xl text-black">
                Request Details
              </h2>
              {details.user &&
              loginData &&
              loginData.id_user === details.user.id_user ? (
                <>
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="text-lg cursor-pointer"
                    onClick={() => setOpenEdit({ details: true })}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    color="red"
                    className="text-lg cursor-pointer"
                    onClick={() =>
                      setWarning({
                        message:
                          "Are you sure you want to delete this request?",
                        confirmDanger: true,
                        confirmAction: handleDelete,
                      })
                    }
                  />
                </>
              ) : null}
            </div>
            <hr className="my-4 border-gray-300" />

            <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
              <div>
                <p className="font-normal text-gray-600">Request Title</p>{" "}
                {details.request.title}
              </div>
              <div>
                <p className="font-normal text-gray-600">Request Description</p>{" "}
                <textarea
                  style={{ resize: "none" }}
                  readOnly
                  className="bg-transparent w-full outline-none"
                  placeholder="No description provided"
                >
                  {details.request.description}
                </textarea>
              </div>
              <div>
                <p className="font-normal text-gray-600">Date Requested</p>{" "}
                {formatDate(details.request.date_created)}
              </div>
              {details.request.date_updated ? (
                <div>
                  <p className="font-normal text-gray-600">Last Updated</p>{" "}
                  {formatDate(details.request.date_updated)}
                </div>
              ) : null}
              <div>
                <p className="font-normal text-gray-600">
                  Total Reimbursement Amount
                </p>{" "}
                {formatPrice(details.request.total_price)}
              </div>
              <div>
                <p className="font-normal text-gray-600">
                  Request Repayment Type
                </p>{" "}
                {details.request.type}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-gray-200 border rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-xl mb-4 text-black">
              Requestor User Details{" "}
              {!details.user.active ? "(INACTIVE USER)" : ""}
            </h2>
            <hr className="my-4 border-gray-300" />

            <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
              <div>
                <p className="font-normal text-gray-600">Username</p>{" "}
                {details.user.username}{" "}
              </div>
              <div>
                <p className="font-normal text-gray-600">Email</p>{" "}
                {details.user.email}
              </div>
              <div>
                <p className="font-normal text-gray-600">
                  Requestor Access Role
                </p>{" "}
                {details.user.role}
              </div>
              <div>
                <p className="font-normal text-gray-600">NIK Number</p>{" "}
                {details.user.nik}
              </div>
              <div>
                <p className="font-normal text-gray-600">Bank Name</p>{" "}
                {details.request.bank_name}
              </div>
              <div>
                <p className="font-normal text-gray-600">Bank Number</p>{" "}
                {details.request.bank_number}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-gray-200 border rounded-lg p-6 mb-8">
            <div className="mb-4 flex justify-start items-center gap-4">
              <h2 className="font-semibold text-xl text-black">
                Request Items
              </h2>
              {details.user &&
              loginData &&
              loginData.id_user === details.user.id_user ? (
                <FontAwesomeIcon
                  icon={faEdit}
                  className="text-lg cursor-pointer"
                  onClick={() => setOpenEdit({ items: true })}
                />
              ) : null}
            </div>
            <hr className="my-4 border-gray-300" />

            <ul className="list-none max-h-64 overflow-y-scroll overflow-x-scroll rounded-lg">
              {details.items.map((i) => (
                <ItemListItem
                  key={i.id_item}
                  item={i}
                  items={details.items}
                  cantRemove={true}
                  setViewImage={setViewImage}
                />
              ))}
            </ul>
          </div>

          {/* Approval Status */}
          <div className="bg-gray-200 border rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-xl mb-4 text-black">
              Request Approval Status
              <span
                className={`bg-${
                  details.request.status === "pending"
                    ? "yellow"
                    : details.request.status === "approved" ||
                      details.request.status === "paid"
                    ? "blue"
                    : "red"
                }-500 p-2 ml-4 rounded-full font-bold text-white`}
              >
                {(details.request.status === "paid"
                  ? "approved"
                  : details.request.status
                ).toUpperCase()}
              </span>
            </h2>
            <hr className="my-4 border-gray-300" />

            <div className="mb-6">
              <h2>Verification Status</h2>
            </div>

            <ul className="list-none max-h-64 mb-6 overflow-y-scroll overflow-x-scroll rounded-lg">
              {details.items.map((i) => (
                <li
                  className="min-w-full w-fit p-2 bg-primary text-white flex items-center rounded-lg justify-between [&:not(:last-child)]:mb-3"
                  key={i.id_item}
                >
                  <p className="basis-0 grow w-full min-w-64">{i.name}</p>
                  <div className="space-x-3 min-w-40">
                    <span
                      className={`bg-${
                        !i.approval.status || i.approval.status === "pending"
                          ? "yellow"
                          : i.approval.status === "approved"
                          ? "green"
                          : "red"
                      }-500 p-1 text-xs ml-4 rounded-full font-bold text-white my-auto inline`}
                    >
                      {i.approval.status
                        ? i.approval.status.toUpperCase()
                        : "PENDING"}
                    </span>
                    {i.approval.status && i.approval.status !== "pending" ? (
                      <button
                        className="btn secondary h-tertiary rounded-full text-xs p-1"
                        onClick={() => setViewApproval(i.approval)}
                      >
                        Details
                      </button>
                    ) : null}
                    {loginData &&
                    loginData.role === "verification" &&
                    loginData.id_user !== details.user.id_user &&
                    !i.approval.status ? (
                      <button
                        className="btn tertiary h-secondary inline text-xs p-1 rounded-sm text-white"
                        onClick={() => setApproveItem(i.id_item)}
                      >
                        CHANGE
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <hr className="my-4 border-gray-300" />

            <div className="mb-6">
              <h2>Approver Status</h2>
            </div>

            <ul className="list-none max-h-64 mb-6 overflow-y-scroll overflow-x-scroll rounded-lg">
              {details.items.filter(
                (i) =>
                  Object.keys(i.approval).length > 0 &&
                  i.approval.status !== "rejected"
              ).length > 0 ? (
                details.items
                  .filter(
                    (i) =>
                      Object.keys(i.approval).length > 0 &&
                      i.approval.status !== "rejected"
                  )
                  .map((i) => (
                    <li
                      className="min-w-full w-fit p-2 bg-primary text-white flex items-center rounded-lg justify-between [&:not(:last-child)]:mb-3"
                      key={i.id_item}
                    >
                      <p className="basis-0 grow w-full min-w-64">{i.name}</p>
                      <div className="space-x-3 min-w-40">
                        <span
                          className={`bg-${
                            i.payment.status
                              ? i.payment.status === "approved"
                                ? "yellow"
                                : i.payment.status === "paid"
                                ? "green"
                                : "red"
                              : ""
                          }-500 p-1 text-xs ml-4 rounded-full font-bold text-white my-auto inline`}
                        >
                          {i.payment.status
                            ? i.payment.status === "approved"
                              ? "PENDING"
                              : i.payment.status.toUpperCase()
                            : null}
                        </span>
                        {i.payment.status && i.payment.status !== "approved" ? (
                          <button
                            className="btn secondary h-tertiary rounded-full text-xs p-1"
                            onClick={() => setViewApproval(i.payment)}
                          >
                            Details
                          </button>
                        ) : null}
                        {loginData &&
                        loginData.role === "approver" &&
                        loginData.id_user !== details.user.id_user &&
                        i.payment.status === "approved" ? (
                          <button
                            className="btn tertiary h-secondary inline text-xs p-1 rounded-sm text-white"
                            onClick={() => setPayItem(i.id_item)}
                          >
                            CHANGE
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))
              ) : (
                <p className="w-full text-center">Awaiting item verification</p>
              )}
            </ul>

            {loginData && loginData.role === "approver" ? (
              <button
                className="btn primary"
                onClick={() =>
                  setWarning({
                    message: "Are you sure you want to notify the requestor?",
                    confirmAction: () => handleNotify(),
                  })
                }
              >
                <FontAwesomeIcon
                  icon={faMailBulk}
                  color="white"
                  className="mr-2"
                />{" "}
                Notify Requestor
              </button>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
