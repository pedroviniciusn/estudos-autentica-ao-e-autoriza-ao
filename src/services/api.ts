import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

type AxiosErrorResponse = {
  code?: string;
};

let cookies = parseCookies();

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
        
        try {
          api
          .post("/refresh", {
            refreshToken: refreshtoken
          },)
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
          });
        } catch (error) {
          console.log(error)
        }
      } else {
      }
    }
  }
);
