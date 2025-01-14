import { useContext, useState } from "react";
import { WarningContext } from "../../providers/WarningProvider";
import PopupContainer from "../PopupContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import FileInput from "../FileInput";
import { verifyInput } from "../../util/verifyInput";
import CategoryDropdown from "../CategoryDropdown";

export default function Popup_AddItem({ editing, setItems, setOpenPopup }) {
  const { warning, setWarning } = useContext(WarningContext);

  const [categoryInput, setCategoryInput] = useState(undefined);
  const [descriptionInput, setDescriptionInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [fileInput, setFileInput] = useState([]);

  function handleAdd() {
    if (!descriptionInput || !dateInput || !priceInput || fileInput.length <= 0)
      return setWarning({
        headerMessage: "Failed To Add Item",
        message: "All fields can't be empty",
        singleConfirm: true,
      });

    setItems((prevItems) => [
      ...prevItems,
      {
        name: descriptionInput,
        price: priceInput,
        date: dateInput,
        category: categoryInput,
        image: fileInput[0],
      },
    ]);

    setDescriptionInput("");
    setDateInput("");
    setPriceInput("");
    setFileInput([]);
  }

  return (
    <PopupContainer zIndex={800}>
      <div className="w-[40%] h-[90vh] min-w-96 p-4 bg-white rounded-lg overflow-y-scroll">
        <div className="flex flex-row items-center justify-between">
          <h2 className="font-bold">
            {editing ? "Change Item" : "Add Item to Request"}
          </h2>
          <FontAwesomeIcon
            icon={faClose}
            color="black"
            onClick={() => setOpenPopup(false)}
            className="cursor-pointer"
          />
        </div>

        <div className="mb-3 mt-6">
          <label className="block text-sm font-medium text-primary mb-1">
            Request Category
          </label>
          <CategoryDropdown
            className={
              "w-full bg-text px-3 p-2 rounded-lg text-xs outline-none placeholder:text-gray-500 mb-3 cursor-pointer"
            }
            onChange={(value) => setCategoryInput(value)}
          />

          <label className="block text-sm font-medium text-primary mb-1">
            Item Description (remark)
          </label>
          <input
            type="text"
            className="w-full bg-text px-3 p-2 rounded-lg text-xs outline-none placeholder:text-gray-500"
            placeholder="Define the purchased item"
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-primary mb-1 text-left">
            Total Price (Rp)
          </label>
          <input
            type="number"
            className="w-full bg-text px-3 p-2 rounded-lg text-xs outline-none placeholder:text-gray-500"
            placeholder="10000"
            value={priceInput}
            onChange={(e) => {
              setPriceInput(e.target.value);
            }}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-primary mb-1 text-left">
            Date Purchased
          </label>
          <input
            type="date"
            className="w-full bg-text px-3 p-2 rounded-lg text-xs outline-none placeholder:text-gray-500"
            placeholder="Masukkan Total Harga Barang"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
        </div>

        {fileInput.length <= 0 ? (
          <FileInput setValue={setFileInput} singleFile={true} />
        ) : (
          <>
            <label className="block text-sm font-medium text-primary mb-1 text-left">
              Insert Image
            </label>
            <div className="bg-gray-200 rounded-lg w-[80%] mx-auto h-auto aspect-square mb-2 relative p-1">
              <img
                className="w-full h-full object-contain"
                src={URL.createObjectURL(fileInput[0])}
              />
              <button
                className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-800 rounded-lg text-white text-center text-xs"
                onClick={() => setFileInput([])}
              >
                Change Image
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          className="btn primary full text-xs"
          onClick={handleAdd}
        >
          Add Item
        </button>
      </div>
    </PopupContainer>
  );
}
