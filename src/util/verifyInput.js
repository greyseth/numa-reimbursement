export function verifyInput(inputs, onIncomplete, optionals) {
  let isIncomplete = false;

  const params = Object.keys(inputs);
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    if (optionals && optionals.includes(param)) continue;

    if (typeof inputs[param] === "number") {
      if (!inputs[param] && !inputs[param] === 0) isIncomplete = true;
    } else if (typeof inputs[param] === "boolean") continue;
    else {
      if (!inputs[param]) isIncomplete = true;
    }

    if (isIncomplete) break;
  }

  if (isIncomplete) {
    if (typeof onIncomplete === "function") onIncomplete();

    return false;
  } else return true;
}
