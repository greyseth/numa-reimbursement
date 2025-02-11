import {
  faBackward,
  faImage,
  faInfoCircle,
  faMinusSquare,
  faPlusSquare,
  faTrash,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../providers/LoadingProvider";
import { WarningContext } from "../providers/WarningProvider";
import Popup_AddItem from "../components/popups/popup_AddItem";
import ImageViewer from "../components/popups/popup_ImageVIewer";
import { verifyInput } from "../util/verifyInput";
import ItemListItem from "../components/ItemListItem";
import { MessageContext } from "../providers/MessageProvider";

export default function Page_ReimbursementForm() {
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);
  const { message, setMessage } = useContext(MessageContext);

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("reimburse");
  const [bankNumber, setBankNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [items, setItems] = useState([]);
  // items: [{name: "", price: 0, image: File}]

  const [addItem, setAddItem] = useState(false);
  const [viewImage, setViewImage] = useState(undefined);

  async function handleSubmit() {
    const verified = verifyInput(
      {
        title: title,
        items: items,
        bankNumber: bankNumber,
        bankName: bankName,
      },
      (param) =>
        setWarning({
          headerMessage: "Can't Submit Request",
          message: `Input field ${param} cannot be empty`,
          singleConfirm: true,
        })
    );

    if (verified) {
      setLoading({ loading: true, error: false, complete: false });

      try {
        // Manual form and request creation because of images
        let formData = new FormData();

        formData.append("title", title);
        formData.append("description", description);
        formData.append("type", type);
        formData.append("bankNumber", bankNumber);
        formData.append("bankName", bankName);

        for (let i = 0; i < items.length; i++)
          formData.append("images", items[i].image);

        formData.append(
          "items",
          JSON.stringify(
            items.map((i) => ({
              name: i.name,
              price: i.price,
              date: i.date,
              id_category: i.category.id_category,
            }))
          )
        );

        const request = await fetch(
          process.env.REACT_APP_APIHOST + "/requests",
          {
            method: "POST",
            body: formData,
            headers: {
              authorization:
                "Bearer " + window.localStorage.getItem("auth_token"),
            },
          }
        );

        if (request.ok) {
          const response = await request.json();
          if (!response.error)
            setLoading({
              loading: true,
              complete: true,
              onComplete: () =>
                navigate("/request/view/" + response.id_request),
            });
          else {
            console.log(response);
            setLoading({ loading: true, error: true });
          }
        } else {
          console.log(request);
          setLoading({ loading: true, error: true });
        }
      } catch (err) {
        console.log(err);
        setLoading({ error: true });
      }
    } else console.log("unverified");
  }

  return (
    <>
      {addItem ? (
        <Popup_AddItem
          editing={undefined}
          setItems={setItems}
          setOpenPopup={setAddItem}
          defaultValues={{ description: description }}
        />
      ) : null}

      {viewImage === undefined ? null : (
        <ImageViewer
          images={items.map((i) => URL.createObjectURL(i.image))}
          imageIndex={viewImage}
          setClose={setViewImage}
        />
      )}

      {/* Page header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold w-3/4 text-md md:text-xl">
          Create New Request
        </h2>
        <button
          className="btn primary md:space-x-1"
          onClick={() => navigate("/request")}
        >
          <FontAwesomeIcon icon={faBackward} color="white" />
          <span className="hidden md:inline">Back</span>{" "}
        </button>
      </div>

      {/* Form Content */}
      <label className="form-label">Project Based</label>
      <input
        type="text"
        className="form-input mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="form-label">Project Description</label>
      <textarea
        className="form-input min-h-32 mb-4"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <label className="form-label">Request Type</label>
      <select
        className="form-input mb-4"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value={"reimburse"}>Reimburse</option>
        <option value={"petty cash"}>Petty Cash</option>
      </select>

      <div className="w-full grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">
            Bank Account Number{" "}
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="cursor-help"
              onMouseEnter={() =>
                setMessage(`Your bank account number to receive reimbursement`)
              }
              onMouseLeave={() => setMessage("")}
            />
          </label>
          <input
            className="form-input mb-4"
            value={bankNumber}
            onChange={(e) => setBankNumber(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">
            Bank Name{" "}
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="cursor-help"
              onMouseEnter={() =>
                setMessage(`Name of bank associated with account number`)
              }
              onMouseLeave={() => setMessage("")}
            />
          </label>
          <input
            className="form-input mb-4"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </div>
      </div>

      <label className="form-label">Request Items</label>
      <div className="w-dull p-2 rounded-lg bg-text mb-4">
        <div className="w-full flex justify-end items-center gap-2 mb-3">
          <button
            className="btn secondary md:space-x-2"
            disabled={items.length < 1}
            onClick={() => {
              if (items.length > 0)
                setWarning({
                  message: "Do you want to clear the items list?",
                  confirmAction: () => setItems([]),
                  confirmDanger: true,
                });
            }}
          >
            <span className="hidden md:inline">Clear</span>
            <FontAwesomeIcon icon={faMinusSquare} />
          </button>
          <button
            className="btn secondary md:space-x-2"
            onClick={() => setAddItem(true)}
          >
            <span className="hidden md:inline">Add</span>
            <FontAwesomeIcon icon={faPlusSquare} />
          </button>
        </div>

        <ul className="list-none max-h-64 overflow-y-scroll overflow-x-scroll rounded-lg">
          {items.length > 0 ? (
            items.map((i, ii) => (
              <ItemListItem
                key={ii}
                item={i}
                items={items}
                setItems={setItems}
                setViewImage={setViewImage}
              />
            ))
          ) : (
            <h2 className="w-full text-center">No Items Added</h2>
          )}
        </ul>
      </div>

      <button className="btn primary full" onClick={handleSubmit}>
        Submit Request
      </button>
    </>
  );
}
