import "../assets/css/loading_spinner.css";

export default function LoadingSpinner({
  size,
  thickness,
  spinColor,
  backColor,
}) {
  // Optional parameters
  const _size = size ?? "5em";
  const _thickness = thickness ?? "10px";
  const _spinColor = spinColor ?? "tertiary-color";
  const _backColor = backColor ?? "secondary-color";

  return (
    <div className="loading-spinner-container">
      <div
        className="loading-spinner"
        style={{
          width: _size,
          border: `${_thickness} solid var(--${_backColor})`,
          borderBottomColor: `var(--${_spinColor})`,
        }}
      ></div>
    </div>
  );
}
