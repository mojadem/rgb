export default async (request, response) => {
  let url = "https://api.api-ninjas.com/v1/randomimage?width=512&height=512";
  let headers = {
    method: "GET",
    headers: {
      "X-Api-Key": process.env.API_KEY,
      Accept: "image/jpg",
    },
  };

  const res = await fetch(url, headers);
  const data = Buffer.from(await res.arrayBuffer());

  response.send(data);
};
