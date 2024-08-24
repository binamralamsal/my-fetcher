import { api, APIFetcher } from "./lib";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

type API = {
  "/posts": {
    get: {
      success: Post;
      queryParams: {
        userId: number;
        id: number;
      };
      error: { message: string };
    };
    post: {
      success: Post;
      error: { message: string };
      body: Omit<Post, "id">;
    };
  };
  "/posts/:id": {
    get: {
      success: Post;
      error: { message: string };
    };
  };
  "/comments": {
    get: {
      success: {
        postId: number;
        id: number;
        name: string;
        email: string;
        body: string;
      }[];
      error: { message: string };
      queryParams: {
        postId: number;
      };
    };
  };
};

const customApi = new APIFetcher<API>({
  baseUrl: "https://jsonplaceholder.typicode.com",
});

const response = await customApi
  .get("/posts/:id", {
    params: {
      id: "12",
    },
  })
  .json();

if (response.ok) {
  console.log(response.data);
} else {
  console.error("No data found");
}

// Using independently
const response2 = await api
  .get("https://jsonplaceholder.typicode.com/posts")
  // First type passed is data and second one is for error
  .json<Post, { message: string }>();

if (response2.ok) {
  console.log(response2.data);
} else {
  console.error("No data found");
}
