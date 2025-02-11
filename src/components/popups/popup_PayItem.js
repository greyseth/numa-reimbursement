import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopupContainer from "../PopupContainer";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import { LoadingContext } from "../../providers/LoadingProvider";
import request from "../../util/API";
import FileInput from "../FileInput";
import { WarningContext } from "../../providers/WarningProvider";

export default function PayItemPopup({ id_item, setDetails, setClose }) {
  const { warning, setWarning } = useContext(WarningContext);
  const { loading, setLoading } = useContext(LoadingContext);

  const [fileInput, setFileInput] = useState(undefined);
  const [noteInput, setNoteInput] = useState("");

  async function handlePay(approved) {
    if (approved && !fileInput)
      return setWarning({
        headerMessage: "Cannot process",
        message: "Attachment cannot be empty!",
        singleConfirm: true,
      });

    setLoading({ loading: true, error: false, complete: false });

    const formData = new FormData();
    if (approved) formData.append("approved", "true");
    if (approved) formData.append("image", fileInput[0]);
    formData.append("notes", noteInput);

    const request = await fetch(
      process.env.REACT_APP_APIHOST + "/requests/approve/payment/" + id_item,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${window.localStorage.getItem("auth_token")}`,
        },
        body: formData,
      }
    );

    if (!request.ok) return setLoading({ loading: true, error: true });

    setDetails((prevDetails) => {
      // Create a new copy of `details`
      let detailsCopy = {
        ...prevDetails,
        items: prevDetails.items.map((item) => ({ ...item })), // Deep copy `items`
        request: { ...prevDetails.request }, // Copy `request`
      };

      // Find the index of the item to update
      const itemIndex = detailsCopy.items.findIndex(
        (i) => i.id_item === id_item
      );

      // Update the specific item
      if (itemIndex !== -1) {
        console.log(detailsCopy);
        detailsCopy.items[itemIndex].payment.status = approved
          ? "paid"
          : "rejected";
        detailsCopy.items[itemIndex].payment.notes = noteInput;
        console.log(detailsCopy);
      }

      // Update request status based on items
      if (!approved) detailsCopy.request.status = "rejected";

      for (let i = 0; i < detailsCopy.items.length; i++) {
        const item = detailsCopy.items[i];

        if (item.payment.status === "paid") {
          detailsCopy.request.status = "paid";
          break;
        }
      }

      return detailsCopy;
    });

    setLoading({ loading: true, complete: true });
    setClose(undefined);
  }

  return (
    <PopupContainer zIndex={90}>
      <div className="bg-primary p-6 rounded-lg w-[40%] h-[90vh] min-w-96 overflow-y-scroll">
        <div className="border-b-2 border-white gap-4 pb-4 mb-4 flex items-center justify-between">
          <p className="text-white text-lg">Verify Payment</p>
          <FontAwesomeIcon
            icon={faClose}
            color="white"
            className="cursor-pointer"
            onClick={() => setClose(undefined)}
          />
        </div>

        <textarea
          placeholder="Add notes for item"
          className="min-w-86 w-full min-h-32 mb-5 rounded-md p-2 outline-none resize-y"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
        ></textarea>

        <p className="block mb-2 text-sm font-medium text-white">
          Transaction attachment
        </p>
        {!fileInput || fileInput.length < 1 ? (
          <FileInput
            setValue={setFileInput}
            singleFile={true}
            labelOptions={{
              text: "",
              color: "hidden",
            }}
          />
        ) : (
          <>
            {fileInput[0].type.startsWith("image") ? (
              <img
                src={URL.createObjectURL(fileInput[0])}
                className="w-[80%] block mx-auto mb-2 rounded-lg"
              />
            ) : (
              <p className="text-white mb-2 p-2 bg-tertiary rounded">
                Selected: <span className="font-bold">{fileInput[0].name}</span>
              </p>
            )}

            <button
              className="btn secondary block mx-auto mb-4"
              onClick={() => setFileInput(undefined)}
            >
              Remove Attachment
            </button>
          </>
        )}

        <button
          className="btn secondary h-tertiary full mb-2"
          onClick={() => handlePay(true)}
        >
          Approve
        </button>
        <button className="btn red full" onClick={() => handlePay(false)}>
          Reject
        </button>
      </div>
    </PopupContainer>
  );
}
