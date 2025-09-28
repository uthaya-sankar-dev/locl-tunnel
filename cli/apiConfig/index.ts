import axios, { AxiosRequestConfig } from "axios";
import { ReqPayload } from "../utils/common";

export const forwardRequest = async (
  req: ReqPayload,
  port: number,
  tunnelId: string
) => {
  const { method, url, headers, body } = req;
  // console.log(method, url/, typeof headers, body);
  const config: AxiosRequestConfig = {
    method,
    url: `http://localhost:${port}${url}`.replace(tunnelId, ""),
    headers: headers,
    data: body,
  };

  try {
    const res = await axios(config);
    return {
      status: res.status,
      body: res.data,
      headers: res.headers,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
