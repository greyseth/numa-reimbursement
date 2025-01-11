import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopupContainer from "../PopupContainer";
import { useContext, useState } from "react";
import { LoadingContext } from "../../providers/LoadingProvider";
import { WarningContext } from "../../providers/WarningProvider";
import { verifyInput } from "../../util/verifyInput";
import request from "../../util/API";
import formatDate from "../../util/dateFormatter";

export default function CreateExport({ setClose }) {
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);

  const [range, setRange] = useState("month");

  const [monthInput, setMonthInput] = useState({
    year: new Date().getFullYear(),
    month: 1,
  });
  const [dateInput, setDateInput] = useState({});

  async function handleExport() {
    let verified = false;
    if (range === "month") verified = verifyInput(monthInput);
    else if (range === "date")
      verified = verifyInput({ from: dateInput.from, to: dateInput.to });

    if (verified) {
      setLoading({ loading: true });

      try {
        const request = await fetch(
          process.env.REACT_APP_APIHOST + `/requests/export/${range}`,
          {
            method: "POST",
            body:
              range === "month"
                ? monthInput
                : range === "date"
                ? dateInput
                : undefined,
            headers: {
              authorization: `Bearer ${window.localStorage.getItem(
                "auth_token"
              )}`,
            },
            mode: "no-cors",
          }
        );

        if (request.ok) {
          const a = document.createElement("a");
          a.download = `Report_${
            range === "month" ? monthInput.year : formatDate(dateInput.from)
          }-${range === "month" ? monthInput.month : formatDate(dateInput.to)}`;
          a.href = URL.createObjectURL(await request.blob());
          document.body.appendChild(a);
          a.click();
          a.remove();

          setLoading({
            loading: true,
            complete: true,
            message: "Downloading report",
          });
        } else {
          console.log(request);
          setLoading({ loading: true, error: true });
        }
      } catch (err) {
        console.log(err);
        setLoading({ loading: true, error: true });
      }
    } else
      setWarning({
        headerMessage: "Cannot export",
        message: "All fields must be filled",
        singleConfirm: true,
      });
  }

  return (
    <PopupContainer zIndex={10}>
      <div className="p-6 bg-primary rounded-lg">
        <div className="w-full flex justify-between items-center gap-3 mb-2">
          <FontAwesomeIcon
            icon={faClose}
            className="cursor-pointer text-lg"
            color="white"
            onClick={() => setClose(undefined)}
          />
          <h1 className="text-white">Export Reimbursement Data</h1>
        </div>

        <p className="w-full text-center text-white">Export Range</p>
        <select
          className="form-input mb-4"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value={"month"}>Monthly</option>
          <option value={"date"}>Select Date</option>
          <option value={"all"}>All Time</option>
        </select>

        {range === "month" ? (
          <>
            <input
              type="number"
              className="form-input mb-2"
              value={monthInput.year}
              placeholder="Year"
              onChange={(e) =>
                setMonthInput({ ...monthInput, year: e.target.value })
              }
            />
            <select
              className="form-input mb-4"
              value={monthInput.month}
              onChange={(e) => setMonthInput(e.target.value)}
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>
          </>
        ) : range === "date" ? (
          <>
            <p className="text-white">From</p>
            <input
              className="form-input mb-2"
              type="date"
              value={dateInput.from}
              onChange={(e) =>
                setDateInput({ ...dateInput, from: e.target.value })
              }
            />
            <p className="text-white">To</p>
            <input
              className="form-input mb-4"
              type="date"
              value={dateInput.to}
              onChange={(e) =>
                setDateInput({ ...dateInput, to: e.target.value })
              }
            />
          </>
        ) : null}

        <button className="btn secondary full" onClick={handleExport}>
          Export Data
        </button>
      </div>
    </PopupContainer>
  );
}
