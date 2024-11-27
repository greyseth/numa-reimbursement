export default function PopupContainer({ children, zIndex }) {
  return (
    <section
      className={`fixed left-0 top-0 w-full h-lvh bg-gray-300/50 flex justify-center items-center`}
      style={{ zIndex: zIndex }}
    >
      {children}
    </section>
  );
}
