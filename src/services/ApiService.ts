import axios from 'axios';

import type {
  AxiosInstance,
  AxiosRequestConfig
} from 'axios';

class ApiClient {
  private api: AxiosInstance;

  constructor(axiosConfig: AxiosRequestConfig) {
    this.api = axios.create(axiosConfig);
  }

  get(url: string, params = {}, requestConfig = {}) {
    return this.api({
      method: 'get',
      url,
      params,
      ...requestConfig
    });
  }

  post(url: string, data = {}, requestConfig = {}) {
    return this.api({
      method: 'post',
      url,
      data,
      ...requestConfig
    });
  }

  put(url: string, data = {}, requestConfig = {}) {
    return this.api({
      method: 'put',
      url,
      data,
      ...requestConfig
    });
  }

  delete(url: string, data = {}, requestConfig = {}) {
    return this.api({
      method: 'delete',
      url,
      data,
      ...requestConfig
    });
  }
}

export default new ApiClient({
  baseURL: import.meta.env.DW_API_URL,
  withCredentials: true,
  responseType: 'json'
});
