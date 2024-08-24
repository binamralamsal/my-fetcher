import { api, APIFetcher } from "./lib";

type API = {
  "/users": {
    post: {
      error: { message: string };
      success: { name: string; id: string; email: string };
    };
    get: {
      error: { message: string };
      success: { name: string; id: string };
    };
  };
  "/asdf": {
    get: {
      error: { ds: string };
      success: { good: number };
    };
    post: {
      error: { ds: string };
      success: { good: number };
    };
  };
};

const customApi = new APIFetcher<API>({
  baseUrl: "https://jsonplaceholder.typicode.com",
  headers: {
    "x-api-key": "123",
  },
});

const response = await customApi
  .get("/users", {
    body: {
      title: "foo",
      body: "bar",
    },
  })
  .json();

const response2 = await api.get("asdf").json<{ hello: string }>();
