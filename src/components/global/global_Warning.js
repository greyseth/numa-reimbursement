import {
  faClose,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import PopupContainer from "../PopupContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import { WarningContext } from "../../providers/WarningProvider";

export default function GlobalWarning({
  headerMessage,
  message,
  singleConfirm,
  confirmDanger,
  cancelAction,
  confirmAction,
}) {
  const { warning, setWarning } = useContext(WarningContext);

  useEffect(() => {
    function handleClose(e) {
      if (e.key === "Escape") {
        if (singleConfirm && typeof confirmAction === "function")
          confirmAction();
        else {
          if (typeof cancelAction === "function") cancelAction();
        }
        setWarning(undefined);
      }
    }

    document.body.addEventListener("keydown", handleClose);
    return document.body.addEventListener("keydown", handleClose);
  }, []);

  return (
    <PopupContainer zIndex={999}>
      <div className="bg-[#1D1C21] p-6 rounded-lg" style={{ width: "300px" }}>
        <div className="border-b-2 border-white gap-4 pb-4 mb-4 flex items-center">
          <FontAwesomeIcon
            icon={faClose}
            color="white"
            className="cursor-pointer"
            onClick={() => {
              if (typeof cancelAction === "function") cancelAction();
              setWarning(undefined);
            }}
          />
          <p className="text-white text-lg">
            {headerMessage ? headerMessage : "Process Confirmation"}
          </p>
        </div>
        <FontAwesomeIcon
          icon={faExclamationCircle}
          color="white"
          style={{
            display: "block",
            width: "10em",
            height: "auto",
            aspectRatio: "1/1",
            margin: "0 auto",
            marginBottom: "1em",
          }}
        />
        <p className="text-white text-center">
          {message
            ? message
            : "Are you sure you want to continue this process?"}
        </p>
        {!singleConfirm ? (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              className="p-2 grow rounded bg-white text-black hover:bg-gray-500 hover:text-white"
              onClick={() => {
                if (typeof cancelAction === "function") cancelAction();
                setWarning(undefined);
              }}
            >
              No
            </button>
            <button
              className={`p-2 grow rounded ${
                confirmDanger ? "bg-red-600 text-white" : "bg-white text-black"
              } hover:bg-gray-500 hover:text-white`}
              onClick={() => {
                setWarning(undefined);
                if (confirmAction) confirmAction();
              }}
            >
              Yes
            </button>
          </div>
        ) : (
          <button
            className="mt-6 p-2 w-full bg-white text-black hover:bg-gray-500 hover:text-white rounded"
            onClick={() => {
              setWarning(undefined);
              if (confirmAction) confirmAction();
            }}
          >
            Ok
          </button>
        )}
      </div>
    </PopupContainer>
  );
}
