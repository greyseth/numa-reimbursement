import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopupContainer from "../PopupContainer";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import formatDate from "../../util/dateFormatter";

export default function ViewApprovalPopup({ approval, setClose }) {
  return (
    <PopupContainer zIndex={90}>
      <div className="bg-primary p-6 rounded-lg">
        <div className="border-b-2 border-white gap-4 pb-4 mb-4 flex items-center justify-between">
          <p className="text-white text-lg">Item Approval Detail</p>
          <FontAwesomeIcon
            icon={faClose}
            color="white"
            className="cursor-pointer"
            onClick={() => setClose(undefined)}
          />
        </div>

        <textarea
          placeholder="No notes provided"
          className="min-w-86 w-full min-h-32 mb-2 rounded-md p-2 outline-none resize-y"
          value={approval.notes}
          readOnly
        ></textarea>
        <p className="text-white">
          {approval.status.toUpperCase()} by {approval.approver}
        </p>
        <p className="text-white">on {formatDate(approval.date)}</p>
      </div>
    </PopupContainer>
  );
}
