import type { HTTPHeaders, Options } from "./types";

export class APIError<T = unknown> extends Error {
  constructor(public status: number, statusText: string, public data: T) {
    super(statusText);
    this.name = "APIError";
  }
}

interface APIFetcherConfig {
  baseUrl?: string;
  headers?: HTTPHeaders;
  credentials?: Options["credentials"];
}

export class APIFetcher<
  TRoutes extends Record<
    string,
    Partial<
      Record<
        "get" | "post" | "put" | "delete" | "patch",
        { error: unknown; success: unknown }
      >
    >
  >
> {
  private baseUrl: string;
  private headers: HTTPHeaders;
  private credentials: Options["credentials"];

  constructor(config: APIFetcherConfig = {}) {
    const { baseUrl = "", credentials, headers = {} } = config;
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.headers = headers;
    this.credentials = credentials;
  }

  private async fetchData<TResponse, TError>(
    url: string,
    type: "json" | "text",
    opts: Options
  ) {
    const { body, method = "GET", headers: customHeaders } = opts;
    const headers = { ...this.headers, ...customHeaders };
    const requestBody = this.prepareRequestBody(body, headers);
    const baseUrl = opts.baseUrl ?? this.baseUrl;
    const credentials = opts.credentials ?? this.credentials;

    const fullUrl = baseUrl + url;

    const response = await fetch(fullUrl, {
      method,
      headers,
      credentials,
      body: requestBody,
    });
    const data =
      type === "json" ? await response.json() : await response.text();

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      type: response.type,
      url: response.url,
    };

    if (!response.ok)
      return { ...result, data: data as TError, ok: false as const };

    return {
      ...result,
      data: data as TResponse,
      ok: true as const,
    };
  }

  private prepareRequestBody(body: Options["body"], headers: HTTPHeaders) {
    if (body && typeof body === "object" && !(body instanceof FormData)) {
      headers["content-type"] = "application/json";
      return JSON.stringify(body);
    }
    return body;
  }

  private createMethod<
    TMethod extends "get" | "post" | "put" | "delete" | "patch"
  >(method: TMethod) {
    return <
      T extends
        | keyof {
            [K in keyof TRoutes as TMethod extends keyof TRoutes[K]
              ? K
              : never]: any;
          }
        | (string & {})
    >(
      url: T,
      opts: Omit<Options, "method"> = {}
    ) => {
      type Route = TRoutes[T];
      type ResultType = Route extends Record<TMethod, infer TRoute>
        ? TRoute extends { success: infer TSuccess }
          ? TSuccess
          : unknown
        : unknown;
      type ErrorType = Route extends Record<TMethod, infer TRoute>
        ? TRoute extends { error: infer TError }
          ? TError
          : unknown
        : unknown;

      if (typeof url !== "string") {
        throw new Error("The URL must be a string.");
      }

      return {
        json: <CustomResultType = ResultType, CustomErrorType = ErrorType>() =>
          this.fetchData<CustomResultType, CustomErrorType>(url, "json", {
            ...opts,
            method,
          }),
        text: () =>
          this.fetchData<string, ErrorType>(url, "text", { ...opts, method }),
      };
    };
  }

  get = this.createMethod("get");
  post = this.createMethod("post");
  put = this.createMethod("put");
  delete = this.createMethod("delete");
  patch = this.createMethod("patch");
}

export const api = new APIFetcher();
