export function verifyInput(inputs, onIncomplete, optionals) {
  let incompleteParam = undefined;
  let isIncomplete = false;

  const params = Object.keys(inputs);
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    if (optionals && optionals.includes(param)) continue;

    if (typeof inputs[param] === "number") {
      if (!inputs[param] && !inputs[param] === 0) isIncomplete = true;
    } else if (typeof inputs[param] === "boolean") continue;
    else if (typeof inputs[param] === "object") {
      if (inputs[param].length) {
        if (inputs[param].length < 1) isIncomplete = true;
      } else {
        if (Object.keys(inputs[param]).length < 1) isIncomplete = true;
      }
    } else {
      if (!inputs[param]) isIncomplete = true;
    }

    if (isIncomplete) {
      incompleteParam = params[i];
      break;
    }
  }

  if (isIncomplete) {
    if (typeof onIncomplete === "function") onIncomplete(incompleteParam);

    return false;
  } else return true;
}
