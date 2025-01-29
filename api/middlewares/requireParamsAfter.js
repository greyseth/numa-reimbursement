const requireParamsAfter = (req, res, params, cb) => {
  let missingParam = false;

  for (let i = 0; i < params.length; i++) {
    if (!req.body[params[i]]) {
      missingParam = true;
      res
        .status(400)
        .json({ error: `Missing required '${params[i]}' parameter` });
      break;
    }
  }

  if (!missingParam) {
    if (typeof cb === "function") cb();
  }
};

module.exports = requireParamsAfter;
