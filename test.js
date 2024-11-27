async function request(method, endpoint, body) {
  const requestOptions = {
    method: method,
    headers: {
      authorization: `Bearer askjdlaskjdoid`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  if (method !== "GET") requestOptions.body = JSON.stringify(body);

  try {
    const request = await fetch(
      "http://localhost:3001" + endpoint,
      requestOptions
    );

    console.log(request.headers.get("content-type"));

    if (request.ok) {
      const contentType = request.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1)
        return await request.json();
    } else {
      console.log(request);
      const contentType = request.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1)
        return {
          error: { status: request.status, details: await request.json() },
        };

      return { error: { status: request.status } };
    }
  } catch (err) {
    return { error: err };
  }
}

(async () => {
  const response = await request("GET", "/users/self");
  console.log("respose:" + response);
})();
