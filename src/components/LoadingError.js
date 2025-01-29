export default function LoadingError({ onRetry }) {
  return (
    <div className="w-full">
      <p className="font-bold mb-3 w-full text-center">An Error Has Occurred</p>
      <button className="btn primary block mx-auto text-xs" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
