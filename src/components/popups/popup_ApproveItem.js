import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopupContainer from "../PopupContainer";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import { LoadingContext } from "../../providers/LoadingProvider";
import request from "../../util/API";

export default function ApproveItemPopup({ id_item, setDetails, setClose }) {
  const { loading, setLoading } = useContext(LoadingContext);

  const [noteInput, setNoteInput] = useState("");

  async function handleApprove(approved) {
    setLoading({ loading: true, error: false, complete: false });

    const response = await request("PUT", "/requests/approve/item/" + id_item, {
      approved: approved,
      notes: noteInput,
    });
    if (response && response.error)
      return setLoading({ loading: true, error: true });

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
        detailsCopy.items[itemIndex].approval.status = approved
          ? "approved"
          : "rejected";
        detailsCopy.items[itemIndex].approval.notes = noteInput;
      }

      // Update request status based on items
      if (!approved) detailsCopy.request.status = "rejected";
      else {
        detailsCopy.request.status = "approved";
        for (let i = 0; i < detailsCopy.items.length; i++) {
          const item = detailsCopy.items[i];

          if (item.approval.status !== "approved") {
            detailsCopy.request.status = "pending";
            break;
          }
        }
      }

      return detailsCopy;
    });

    setLoading({ loading: true, complete: true });
    setClose(undefined);
  }

  return (
    <PopupContainer zIndex={90}>
      <div className="bg-primary p-6 rounded-lg">
        <div className="border-b-2 border-white gap-4 pb-4 mb-4 flex items-center justify-between">
          <p className="text-white text-lg">Approve Item</p>
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

        <button
          className="btn secondary h-tertiary full mb-2"
          onClick={() => handleApprove(true)}
        >
          Approve
        </button>
        <button className="btn red full" onClick={() => handleApprove(false)}>
          Reject
        </button>
      </div>
    </PopupContainer>
  );
}
