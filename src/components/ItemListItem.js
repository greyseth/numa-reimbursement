import { useContext } from "react";
import { WarningContext } from "../providers/WarningProvider";
import formatPrice from "../util/priceFormatter";
import formatDate from "../util/dateFormatter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function ItemListItem({
  item,
  items,
  setItems,
  setViewImage,
  cantRemove,
}) {
  const { warning, setWarning } = useContext(WarningContext);

  function handleRemove() {
    setItems((prevItems) => prevItems.filter((i) => i != item));
  }

  function viewImage() {
    const itemIndex = items.findIndex((i) => i == item);

    if (itemIndex !== -1) setViewImage(itemIndex);
    else
      setWarning({
        headerMessage: "Something Went Wrong",
        message: "Could not find item",
        singleConfirm: true,
      });
  }

  return (
    <li className="min-w-full w-fit p-2 bg-white rounded-lg flex items-center gap-3 [&:not(:last-child)]:mb-3">
      <p className="basis-0 grow min-w-36 md:min-w-48">{item.name}</p>
      <p className="basis-0 grow min-w-36 md:min-w-48 text-center">
        {item.category.category}
      </p>
      <p className="text-wrap">{formatPrice(item.price)}</p>
      <p className="">{formatDate(item.date)}</p>
      <div
        className={`flex items-center justify-end gap-2 ${
          !cantRemove ? "min-w-24" : ""
        }`}
      >
        <button onClick={viewImage}>
          <FontAwesomeIcon icon={faImage} size="2x" className="btn primary" />
        </button>
        {!cantRemove ? (
          <button onClick={handleRemove}>
            <FontAwesomeIcon icon={faTrash} size="2x" className="btn red" />
          </button>
        ) : null}
      </div>
    </li>
  );
}
