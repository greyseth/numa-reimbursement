import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import hasExtension from "../util/extensionCheck";
import { faFileUpload } from "@fortawesome/free-solid-svg-icons";

const { useContext, useState } = require("react");
const { WarningContext } = require("../providers/WarningProvider");

export default function FileInput({
  setValue,
  setDisplayValue,
  singleFile,
  labelOptions,
}) {
  const { warning, setWarning } = useContext(WarningContext);
  const [hovering, setHovering] = useState(false);

  return (
    <div className="mb-4">
      <label
        htmlFor="small-input"
        className={`block mt-3 mb-2 text-sm font-medium ${
          labelOptions && labelOptions.color
            ? labelOptions.color
            : "text-gray-900"
        }`}
      >
        {labelOptions && labelOptions.text ? labelOptions.text : "File Upload"}
      </label>

      <div
        className="flex items-center justify-center w-full"
        onDrop={(e) => {
          e.preventDefault();
          setHovering(false);

          if (e.dataTransfer.files.length > 0) {
            if (singleFile && e.dataTransfer.files.length > 1)
              return setWarning({
                headerMessage: "Failed to upload file(s)",
                message: "Multiple files not accepted",
                singleConfirm: true,
              });

            let invalidFile = false;

            let names = [];
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
              if (
                hasExtension(e.dataTransfer.files[i].name, [
                  "png",
                  "jpeg",
                  "jpg",
                  "pdf",
                ])
              )
                names.push(e.dataTransfer.files[i].name);
              else {
                invalidFile = true;
                break;
              }
            }

            if (invalidFile)
              return setWarning({
                headerMessage: "Failed to upload file(s)",
                message: "File extension not supported",
                singleConfirm: true,
              });

            setValue(e.dataTransfer.files);
            if (typeof setDisplayValue === "function") setDisplayValue(names);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setHovering(true)}
        onDragExit={() => setHovering(false)}
      >
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-200 hover:bg-gray-300"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FontAwesomeIcon icon={faFileUpload} className="w-8 h-8 mb-4" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">
                {hovering
                  ? "Drop to upload the file"
                  : "Pick a file or drag and drop"}
              </span>
            </p>
            {!hovering ? (
              <p className="text-xs text-gray-500">PNG, JPG, JPEG, or PDF</p>
            ) : null}
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/jpg, image/jpeg, image/png, image/bmp, application/pdf"
            multiple={!singleFile}
            onChange={(e) => {
              setValue(e.target.files);
              let names = [];
              for (let i = 0; i < e.target.files.length; i++)
                names.push(e.target.files[i].name);
              if (typeof setDisplayValue === "function") setDisplayValue(names);
            }}
          />
        </label>
      </div>
    </div>
  );
}
