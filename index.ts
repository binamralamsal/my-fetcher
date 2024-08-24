import { api, APIFetcher, type ExtractParams } from "./lib";

type API = {
  "/users": {
    post: {
      error: { message: string };
      success: { name: string; id: string; email: string };
      body: {
        username: string;
        age: number;
      };
    };
    get: {
      error: { message: string };
      success: { name: string; id: string };
    };
  };
  "/users/:id/:username": {
    post: {
      error: { message: string };
      success: { name: string; id: string; email: string };
      body: { as: boolean };
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
    "content-type": "application/json",
  },
});

const response = await customApi
  .post("/users/:id/:username", {
    params: {
      id: "asdf",
      username: "asdf",
    },
    body: {
      as: true,
    },
  })
  .json();

const response2 = await api.get("asdf").json<{ hello: string }>();
