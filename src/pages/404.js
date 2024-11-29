import { useLocation, useNavigate } from "react-router-dom";

export default function Page_404() {
  const navigate = useNavigate();
  let location = useLocation();

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-9xl text-primary hover:text-secondary font-bold cursor-default">
        404
      </h1>
      <p>
        The URL <span className="italic font-bold">{location.pathname}</span>{" "}
        was not found
      </p>
      <button className="btn primary" onClick={() => navigate("/")}>
        Back to dashboard
      </button>
    </section>
  );
}
