import { useContext, useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import request from "../util/API";
import { useParams } from "react-router-dom";
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
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import RequestEditDetails from "../components/popups/popup_EditRequestDetails";
import RequestEditItems from "../components/popups/popup_EditRequestItems";

export default function Page_ReimbursementView() {
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);
  const { loginData, setLoginData } = useContext(LoginContext);
  const { id_request } = useParams();

  const [detailsLoading, setDetailsLoading] = useState({
    loading: true,
  });
  const [details, setDetails] = useState({});

  const [viewImage, setViewImage] = useState(undefined);
  const [approveItem, setApproveItem] = useState(undefined);
  const [viewApproval, setViewApproval] = useState(undefined);
  const [openEdit, setOpenEdit] = useState({});

  const [financeNote, setFinanceNote] = useState("");
  const [financeFile, setFinanceFile] = useState(undefined);
  const [financeViewImage, setFinanceViewImage] = useState(undefined);

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

  async function handleFinanceApprove(approved) {
    setLoading({ loading: true, error: false, complete: false });

    try {
      // Manual form and request creation because of images
      let formData = new FormData();

      formData.append("approved", approved);
      formData.append("notes", financeNote);
      formData.append("image", financeFile[0]);

      const request = await fetch(
        process.env.REACT_APP_APIHOST +
          "/requests/approve/payment/" +
          id_request,
        {
          method: "PUT",
          body: formData,
          headers: {
            authorization:
              "Bearer " + window.localStorage.getItem("auth_token"),
          },
        }
      );

      if (request.ok) {
        const response = await request.json();

        setLoading({
          loading: true,
          complete: true,
          onComplete: () => {
            setDetails({
              ...details,
              finance: {
                ...response,
                user: {
                  username: loginData.username,
                  email: loginData.email,
                },
              },
            });
          },
        });
      } else {
        console.log(request);
        setLoading({ loading: true, error: true });
      }
    } catch (err) {
      console.log(err);
      setLoading({ error: true });
    }
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

      {financeViewImage === undefined ? null : (
        <ImageViewer
          images={[process.env.REACT_APP_APIHOST + "/img/" + financeViewImage]}
          imageIndex={0}
          setClose={setFinanceViewImage}
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
                <FontAwesomeIcon
                  icon={faEdit}
                  className="text-lg cursor-pointer"
                  onClick={() => setOpenEdit({ details: true })}
                />
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
                  Reimbursement Repayment Type
                </p>{" "}
                {details.request.type}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-gray-200 border rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-xl mb-4 text-black">
              Requestor User Details
            </h2>
            <hr className="my-4 border-gray-300" />

            <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
              <div>
                <p className="font-normal text-gray-600">Username</p>{" "}
                {details.user.username}
              </div>
              <div>
                <p className="font-normal text-gray-600">Email</p>{" "}
                {details.user.email}
              </div>
              <div>
                <p className="font-normal text-gray-600">NIK Number</p>{" "}
                {details.user.nik}
              </div>
              <div></div>
              <div>
                <p className="font-normal text-gray-600">Repayment Bank</p>{" "}
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
            </h2>
            <hr className="my-4 border-gray-300" />

            <div className="mb-6">
              <h2>
                Approver Status
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
            </div>

            <ul className="list-none max-h-64 mb-6 overflow-y-scroll overflow-x-scroll rounded-lg">
              {details.items.map((i) => (
                <li className="min-w-full w-fit p-2 bg-primary text-white flex items-center rounded-lg justify-between [&:not(:last-child)]:mb-3">
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
                    loginData.role === "approver" &&
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

            <h2 className="mb-6">
              Finance Status
              <span
                className={`bg-${
                  details.finance.status === "pending"
                    ? "yellow"
                    : details.finance.status === "approved"
                    ? "blue"
                    : details.finance.status === "paid"
                    ? "green"
                    : "red"
                }-500 p-2 ml-4 rounded-full font-bold text-white`}
              >
                {details.finance.status.toUpperCase()}
              </span>
            </h2>

            {details.finance.status !== "pending" ? (
              <div className="w-full lg:grid lg:grid-cols-[1fr_15em] gap-12">
                <div className="text-sm mb-4 lg:mb-0">
                  <textarea
                    className="w-full rounded-lg outline-none p-2 h-24 resize-y"
                    placeholder="No notes provided"
                    readOnly
                  ></textarea>
                  <p>
                    {details.finance.status.toUpperCase()} by{" "}
                    {details.finance.user.username}
                  </p>
                  <p>on {formatDate(details.finance.date)}</p>
                </div>
                <div>
                  <button
                    className="btn primary full"
                    onClick={() => setFinanceViewImage(details.finance.image)}
                  >
                    View Payment Proof
                  </button>
                </div>
              </div>
            ) : loginData && loginData.role === "finance" ? (
              <div className="w-full md:grid md:grid-cols-[1fr_15em] gap-12">
                <div>
                  <textarea
                    className="w-full rounded-lg outline-none p-2 h-24 resize-y mb-3"
                    placeholder="Add notes for approval"
                    value={financeNote}
                    onChange={(e) => setFinanceNote(e.target.value)}
                  ></textarea>
                  {financeFile ? (
                    <>
                      <div className="flex items-center justify-between gap-6 mb-2">
                        <p className="basis-0 grow w-full">
                          {financeFile[0].name}
                        </p>
                        <button
                          className="btn primary"
                          onClick={() => setFinanceFile(undefined)}
                        >
                          Change
                        </button>
                      </div>
                      <img
                        src={URL.createObjectURL(financeFile[0])}
                        className="w-full h-auto mb-8 md:mb-0"
                      />
                    </>
                  ) : (
                    <FileInput setValue={setFinanceFile} singleFile={true} />
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    className="btn green full"
                    onClick={() => handleFinanceApprove(true)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn red full"
                    onClick={() => handleFinanceApprove(false)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <p>Pending finance review</p>
            )}
          </div>
        </>
      )}
    </>
  );
}
