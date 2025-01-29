import { faClose, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopupContainer from "../PopupContainer";
import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../../providers/LoadingProvider";
import { WarningContext } from "../../providers/WarningProvider";
import Popup_AddItem from "./popup_AddItem";
import request from "../../util/API";

export default function RequestEditItems({ details, setDetails, setClose }) {
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);

  {
    /* I hate myself more and more every single day because of this */
  }
  const [toDelete, setToDelete] = useState([]);
  const [toAdd, setToAdd] = useState([]);

  const [deleteItem, setDeleteItem] = useState(undefined);
  const [addingItem, setAddingItem] = useState(false);

  async function handleSave() {
    setLoading({ loading: true, error: false, complete: false });

    try {
      // Manual form and request creation because of images
      let formData = new FormData();

      for (let i = 0; i < toAdd.length; i++)
        formData.append("images", toAdd[i].image);

      formData.append(
        "toAdd",
        JSON.stringify(
          toAdd.map((i) => ({ name: i.name, price: i.price, date: i.date }))
        )
      );

      formData.append("toDelete", JSON.stringify(toDelete));

      const request = await fetch(
        process.env.REACT_APP_APIHOST +
          `/requests/${details.request.id_request}/items`,
        {
          method: "PUT",
          body: formData,
          headers: {
            authorization:
              "Bearer " + window.localStorage.getItem("auth_token"),
          },
        }
      );

      if (request.ok) {
        setLoading({
          loading: true,
          complete: true,
          message: "Updated item details",
          onComplete: () => {
            window.location.reload();
          },
        });
      } else {
        console.log(request);
        setLoading({ loading: true, error: true });
      }
    } catch (err) {
      console.log(err);
      setLoading({ loading: true, error: true });
    }
  }

  useEffect(() => {
    if (deleteItem)
      setWarning({
        message: "Are you sure you want to remove this item?",
        cancelAction: () => {
          setDeleteItem(undefined);
        },
        confirmAction: () =>
          setToDelete((prevToDelete) => [...prevToDelete, deleteItem]),
      });
  }, [deleteItem]);

  return (
    <>
      {addingItem ? (
        <Popup_AddItem setOpenPopup={setAddingItem} setItems={setToAdd} />
      ) : null}

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

          {/* why do i do this to myself */}
          {[...details.items, ...toAdd].filter(
            (i) => !toDelete.includes(i.id_item)
          ).length > 0 ? (
            <ul className="list-none max-h-64 mb-6 overflow-y-scroll overflow-x-scroll rounded-lg">
              {[
                ...details.items,
                ...toAdd.map((a) => ({
                  ...a,
                  approval: { status: "pending" },
                })),
              ]
                .filter((i) => !toDelete.includes(i.id_item))
                .map((i, ii) => (
                  <li
                    key={ii}
                    className="min-w-full w-fit p-2 bg-tertiary text-white flex items-center rounded-lg justify-between [&:not(:last-child)]:mb-3"
                  >
                    <p className="basis-0 grow w-full min-w-64">{i.name}</p>
                    <div className="flex justify-between items-center gap-3 ml-3 min-w-[100px]">
                      <span
                        className={`bg-${
                          !i.approval.status || i.approval.status === "pending"
                            ? "yellow"
                            : i.approval.status === "approved"
                            ? "green"
                            : "red"
                        }-500 p-1 text-xs rounded-full font-bold text-white my-auto inline`}
                      >
                        {i.approval.status
                          ? i.approval.status.toUpperCase()
                          : "PENDING"}
                      </span>
                      <FontAwesomeIcon
                        icon={faTrash}
                        color="red"
                        className="cursor-pointer"
                        onClick={() => {
                          if (i.id_item) setDeleteItem(i.id_item);
                          else
                            setToAdd(
                              toAdd.filter(
                                (ta, index) =>
                                  index !== ii - details.items.length
                              )
                            );
                        }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="w-full text-center text-white font-bold mb-3">
              No Items
            </p>
          )}

          <button
            className="btn green full mb-3"
            onClick={() => setAddingItem(true)}
          >
            Add Item
          </button>
          <button
            className="btn secondary h-tertiary full"
            disabled={
              details.items.filter((i) => !toDelete.includes(i.id_item))
                .length < 1
            }
            onClick={() =>
              setWarning({
                headerMessage: "Update confirmation",
                message:
                  "This action will reset finance approval (if applicable)",
                confirmDanger: true,
                confirmAction: handleSave,
              })
            }
          >
            Save Changes
          </button>
        </div>
      </PopupContainer>
    </>
  );
}
