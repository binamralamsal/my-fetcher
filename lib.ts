import type { HTTPHeaders, Options } from "./types";

export class APIError<T = unknown> extends Error {
  constructor(public status: number, statusText: string, public data: T) {
    super(statusText);
    this.name = "APIError";
  }
}

export function isAPIError<T>(error: unknown): error is APIError<T> {
  return error instanceof APIError;
}

interface APIFetcherConfig {
  baseUrl?: string;
  defaultHeaders?: HTTPHeaders;
}

export class APIFetcher {
  private baseUrl: string;
  private defaultHeaders: HTTPHeaders;

  constructor(config: APIFetcherConfig = {}) {
    const { baseUrl = "", defaultHeaders = {} } = config;
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  private async fetchData<TResponse>(
    url: string,
    type: "json" | "text",
    opts: Options
  ) {
    const { body, method = "GET", headers: customHeaders } = opts;
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const requestBody = this.prepareRequestBody(body, headers);

    const fullUrl = this.baseUrl + url;

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: requestBody,
    });
    const data =
      type === "json" ? await response.json() : await response.text();

    if (!response.ok)
      throw new APIError(response.status, response.statusText, data);

    return {
      data: data as TResponse,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      type: response.type,
      url: response.url,
    };
  }

  private prepareRequestBody(body: Options["body"], headers: HTTPHeaders) {
    if (body && typeof body === "object" && !(body instanceof FormData)) {
      headers["content-type"] = "application/json";
      return JSON.stringify(body);
    }
    return body;
  }

  private createMethod(method: string) {
    return (url: string, opts: Omit<Options, "method"> = {}) => ({
      json: <T = unknown>() =>
        this.fetchData<T>(url, "json", { ...opts, method }),
      text: () => this.fetchData<string>(url, "text", { ...opts, method }),
    });
  }

  get = this.createMethod("GET");
  post = this.createMethod("POST");
  put = this.createMethod("PUT");
  delete = this.createMethod("DELETE");
  patch = this.createMethod("PATCH");
}

export const api = new APIFetcher();
