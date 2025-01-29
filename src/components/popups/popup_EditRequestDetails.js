import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopupContainer from "../PopupContainer";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import { LoadingContext } from "../../providers/LoadingProvider";
import request from "../../util/API";
import { WarningContext } from "../../providers/WarningProvider";
import { verifyInput } from "../../util/verifyInput";

export default function RequestEditDetails({ details, setDetails, setClose }) {
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);

  const [titleInput, setTitleInput] = useState(details.request.title);
  const [descriptionInput, setDescriptionInput] = useState(
    details.request.description
  );
  const [bankNameInput, setBankNameInput] = useState(details.request.bank_name);
  const [bankNumberInput, setBankNumberInput] = useState(
    details.request.bank_number
  );
  const [typeInput, setTypeInput] = useState(details.request.type);

  async function handleSave() {
    const verified = verifyInput(
      {
        title: titleInput,
        bankName: bankNameInput,
        bankNumber: bankNumberInput,
        type: typeInput,
      },
      (param) =>
        setWarning({
          headerMessage: "Can't Save Changes",
          message: `The value of '${param}' cannot be empty`,
          singleConfirm: true,
        })
    );
    if (verified) {
      setLoading({ loading: true, error: false, complete: false });

      const response = await request(
        "PUT",
        `/requests/${details.request.id_request}/details`,
        {
          title: titleInput,
          description: descriptionInput,
          bank_number: bankNumberInput,
          bank_name: bankNameInput,
          type: typeInput,
        }
      );
      if (response && response.error)
        return setLoading({ loading: true, error: true });

      setLoading({
        loading: true,
        complete: true,
        onComplete: () => {
          setDetails({
            ...details,
            request: {
              ...details.request,
              title: titleInput,
              description: descriptionInput,
              bank_number: bankNumberInput,
              bank_name: bankNameInput,
              type: typeInput,
            },
          });
          setClose({});
        },
      });
    }
  }

  return (
    <PopupContainer zIndex={90}>
      <div className="bg-primary p-6 rounded-lg">
        <div className="w-full mb-2">
          <FontAwesomeIcon
            icon={faClose}
            className="cursor-pointer text-lg"
            color="white"
            onClick={() => setClose({})}
          />
        </div>
        <input
          className="p-2 rounded bg-white text-input outline-none min-w-full mb-3"
          placeholder="Edit Request Title"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
        />

        <textarea
          className="p-2 rounded bg-white text-input outline-none min-w-full mb-3"
          placeholder="Edit request description"
          value={descriptionInput}
          onChange={(e) => setDescriptionInput(e.target.value)}
        />

        <input
          className="p-2 rounded bg-white text-input outline-none min-w-full mb-3"
          placeholder="Repayment Bank Name"
          value={bankNameInput}
          onChange={(e) => setBankNameInput(e.target.value)}
        />

        <input
          className="p-2 rounded bg-white text-input outline-none min-w-full mb-3"
          placeholder="Repayment Bank Number"
          value={bankNumberInput}
          onChange={(e) => setBankNumberInput(e.target.value)}
        />

        <select
          className="p-2 rounded bg-white text-input outline-none min-w-full mb-3"
          value={typeInput}
          onChange={(e) => setTypeInput(e.target.value)}
        >
          <option value={"reimburse"}>Reimburse</option>
          <option value={"petty cash"}>Petty Cash</option>
        </select>

        <button
          className="btn secondary h-tertiary w-full"
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>
    </PopupContainer>
  );
}
