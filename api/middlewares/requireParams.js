function requireParams(params) {
  return (req, res, next) => {
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

    if (!missingParam) next();
  };
}

module.exports = requireParams;
