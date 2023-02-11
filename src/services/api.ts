import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

type AxiosErrorResponse = {
  code?: string;
};

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue: {
  resolve: (token: string) => AxiosError<AxiosErrorResponse, any> | undefined;
  reject: (error: AxiosError<unknown, any>) => void;
}[] = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<AxiosErrorResponse>) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === "token.expired") {
        cookies = parseCookies();

        const { "nextauth.refreshtoken": refreshtoken } = cookies;
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("/refresh", {
              refreshToken: refreshtoken,
            })
            .then((response) => {
              const { token } = response.data;

              setCookie(undefined, "nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
              });

              setCookie(
                undefined,
                "nextauth.refreshtoken",
                response.data.refreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30,
                  path: "/",
                }
              );

              api.defaults.headers["Authorization"] = `Bearer ${token}`;

              failedRequestsQueue.forEach((request) => request.resolve(token));
              failedRequestsQueue = [];
            })
            .catch((error) => {
              failedRequestsQueue.forEach((request) => request.reject(error));
              failedRequestsQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              if (!originalConfig?.headers) {
                return error;
              }

              originalConfig.headers["Authorization"] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            reject: (error: AxiosError) => {
              reject(error);
            },
          });
        });
      } else {
      }
    }
  }
);
