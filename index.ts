import { APIFetcher, isAPIError } from "./lib";

const customApi = new APIFetcher({
  baseUrl: "https://jsonplaceholder.typicode.com",
  headers: {
    "x-api-key": "123",
  },
});

try {
  const data = await customApi
    .post("/posts", {
      body: {
        title: "foo",
        body: "bar",
      },
    })
    .json<{ hello: string }>();

  console.log(data);
} catch (error) {
  if (isAPIError<{ status: number; message: string }>(error)) {
    console.log(error.data);
  }
}
