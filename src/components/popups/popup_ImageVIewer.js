import { useContext, useState } from "react";
import PopupContainer from "../PopupContainer";
import { MobileContext } from "../../providers/MobileProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faClose,
} from "@fortawesome/free-solid-svg-icons";

export default function ImageViewer({ images, imageIndex, setClose }) {
  const { isMobile, setIsMobile } = useContext(MobileContext);
  const [selectedIndex, setSelectedIndex] = useState(imageIndex ?? 0);

  return (
    <PopupContainer zIndex={800}>
      {!isMobile ? (
        <DesktopView
          images={images}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          setClose={setClose}
        />
      ) : (
        <MobileView
          images={images}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          setClose={setClose}
        />
      )}
    </PopupContainer>
  );
}

function DesktopView({ images, selectedIndex, setSelectedIndex, setClose }) {
  function moveSelection(incr) {
    if (incr) {
      if (selectedIndex >= images.length - 1) setSelectedIndex(0);
      else setSelectedIndex(selectedIndex + 1);
    } else {
      if (selectedIndex <= 0) setSelectedIndex(images.length - 1);
      else setSelectedIndex(selectedIndex - 1);
    }
  }

  return (
    <div
      className={`w-full h-full flex flex-row justify-${
        images.length > 1 ? "between" : "center"
      } items-center`}
    >
      {images.length > 1 ? (
        <button
          className="h-full w-32 bg-gray-500/35 hover:bg-gray-500/50"
          onClick={() => moveSelection(false)}
        >
          <FontAwesomeIcon icon={faChevronLeft} color="white" size="2x" />
        </button>
      ) : null}
      <div className="w-4/5 flex flex-col items-center justify-end gap-6 overflow-y-scroll">
        {!images[selectedIndex].endsWith("pdf") ? (
          <img
            className="w-full max-w-[500px] max-h-[80vh] h-auto"
            src={images[selectedIndex]}
          />
        ) : (
          <>
            <p className="font-bold w-full text-center">
              File is not a previewable image
            </p>
            <p className="w-full text-center text-gray-500">
              {images[selectedIndex]}
            </p>
            <a href={images[selectedIndex]} target="_blank">
              <button className="block mx-auto btn tertiary">
                View Attachment
              </button>
            </a>
          </>
        )}
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white"
          onClick={() => setClose(undefined)}
        >
          Close Image
        </button>
      </div>
      {images.length > 1 ? (
        <button
          className="h-full w-32 bg-gray-500/35 hover:bg-gray-500/50"
          onClick={() => moveSelection(true)}
        >
          <FontAwesomeIcon icon={faChevronRight} color="white" size="2x" />
        </button>
      ) : null}
    </div>
  );
}

function MobileView({ images, selectedIndex, setSelectedIndex, setClose }) {
  function moveSelection(incr) {
    if (incr) {
      if (selectedIndex >= images.length - 1) setSelectedIndex(0);
      else setSelectedIndex(selectedIndex + 1);
    } else {
      if (selectedIndex <= 0) setSelectedIndex(images.length - 1);
      else setSelectedIndex(selectedIndex - 1);
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between">
      <div className="h-[5%] w-full">
        <FontAwesomeIcon
          icon={faClose}
          className="h-full rounded-full cursor-pointer"
          color="black"
          size="2x"
          onClick={() => setClose(undefined)}
        />
      </div>
      <div className="h-full basis-0 grow w-full overflow-x-scroll relative">
        <img
          src={images[selectedIndex]}
          className="max-w-none h-full mx-auto"
        />
      </div>
      <div className="h-[10%] w-full mt-4 grid grid-cols-2">
        <button
          className="bg-gray-500/35 active:bg-gray-500/50"
          onClick={() => moveSelection(false)}
        >
          <FontAwesomeIcon icon={faChevronLeft} color="white" size="1x" />
        </button>
        <button
          className="bg-gray-500/35 active:bg-gray-500/50"
          onClick={() => moveSelection(true)}
        >
          <FontAwesomeIcon icon={faChevronRight} color="white" size="1x" />
        </button>
      </div>
    </div>
  );
}
