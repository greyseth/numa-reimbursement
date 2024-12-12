import { useContext, useState } from "react";
import { MobileContext } from "../providers/MobileProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar({ placeholder, onSearch, clearOnSearch }) {
  const { isMobile, setIsMobile } = useContext(MobileContext);
  const [searchInput, setSearchInput] = useState("");

  function handleSubmit() {
    if (typeof onSearch === "function") onSearch(searchInput);
    if (clearOnSearch) setSearchInput("");
  }

  return (
    <div
      className={`w-full bg-primary rounded-full py-2 px-8 flex ${
        isMobile ? "" : ""
      } justify-between items-center gap-2`}
    >
      <FontAwesomeIcon icon={faSearch} color="white" className="w-5" />

      <input
        className="w-full text-white basis-0 grow bg-transparent focus:outline-none text-xs"
        placeholder={placeholder ?? "Search..."}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      {!isMobile ? (
        <button
          className="p-2 text-white bg-tertiary text-xs font-bold rounded-full min-w-24"
          onClick={handleSubmit}
        >
          Cari
        </button>
      ) : null}
    </div>
  );
}
