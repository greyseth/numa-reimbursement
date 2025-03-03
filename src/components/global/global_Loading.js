import { useContext, useEffect } from "react";
import PopupContainer from "../PopupContainer";
import { LoadingContext } from "../../providers/LoadingProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faClose,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../LoadingSpinner";

export default function GlobalLoading({
  error,
  complete,
  customMessage,
  onComplete,
}) {
  const { loading, setLoading } = useContext(LoadingContext);

  useEffect(() => {
    function handleClose(e) {
      if (loading.error || loading.complete) {
        if (e.key === "Escape")
          setLoading({ loading: false, error: false, complete: false });
      }
    }

    document.body.addEventListener("keydown", handleClose);
    return document.body.addEventListener("keydown", handleClose);
  }, []);

  return (
    <PopupContainer zIndex={999}>
      <div className="bg-primary p-6 rounded-lg" style={{ width: "300px" }}>
        {error ? (
          <Error setLoading={setLoading} customMessage={customMessage} />
        ) : complete ? (
          <Complete
            setLoading={setLoading}
            customMessage={customMessage}
            onComplete={onComplete}
          />
        ) : (
          <BasicLoading customMessage={customMessage} />
        )}

        {loading.customButtons && loading.customButtons.length > 0
          ? loading.customButtons.map((b, i) => (
              <button
                className="w-full my-2 p-2 text-sm text-black bg-white rounded-lg"
                key={i}
                onClick={() => {
                  if (b.action) b.action();
                  setLoading({ loading: false, error: false, complete: false });
                }}
              >
                {b.label}
              </button>
            ))
          : null}
      </div>
    </PopupContainer>
  );
}

function BasicLoading({ customMessage }) {
  return (
    <>
      <div className="border-b-2 border-white gap-4 pb-4 mb-4">
        <p className="text-white text-lg">Please Wait</p>
      </div>
      <LoadingSpinner />
      <p className="w-full text-center text-white mt-6">
        {customMessage ?? "Processing Request..."}
      </p>
    </>
  );
}

function Error({ setLoading, customMessage }) {
  return (
    <>
      <div className="border-b-2 border-white gap-4 pb-4 mb-4 flex items-center">
        <FontAwesomeIcon
          icon={faClose}
          color="white"
          className="cursor-pointer"
          onClick={() =>
            setLoading({ loading: false, error: false, complete: false })
          }
        />
        <p className="text-white text-lg">Failed to Process</p>
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
        {customMessage ?? "An Error Has Occurred"}
      </p>
    </>
  );
}

function Complete({ setLoading, customMessage, onComplete }) {
  return (
    <>
      <div className="border-b-2 border-white gap-4 pb-4 mb-4 flex items-center">
        <FontAwesomeIcon
          icon={faClose}
          color="white"
          className="cursor-pointer"
          onClick={() => {
            if (typeof onComplete === "function") onComplete();
            setLoading({ loading: false, error: false, complete: false });
          }}
        />
        <p className="text-white text-lg">Success</p>
      </div>
      <FontAwesomeIcon
        icon={faCheckCircle}
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
        {customMessage ?? "Process Complete"}
      </p>
    </>
  );
}
