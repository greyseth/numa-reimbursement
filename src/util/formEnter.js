export function submitOnEnter(e, onEnter) {
  if (typeof onEnter === "function") {
    if (e.key === "Enter") onEnter();
  }
}
