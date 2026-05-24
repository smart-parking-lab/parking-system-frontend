import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
  },
  timeout: 30000,
});

// ================= REQUEST =================
axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE =================
axiosClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig;
    console.log("error", error);

    // BỎ QUA API LOGIN
    if (originalRequest.url?.includes('/login')) {
      return Promise.reject(error);
    }

    // refresh token
    if (
      error.response?.status === 410 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        console.log("refresh_token", refreshToken)

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );
        console.log("🚀 Data từ API Refresh:", response.data);

        const newAccessToken = response.data.access_token;
        if (!newAccessToken) {
            console.error("Lỗi: Không tìm thấy access_token trong response!");
        }

        localStorage.setItem('access_token', newAccessToken);

        // 1. CÁCH AN TOÀN NHẤT ĐỂ ÉP AXIOS NHẬN HEADER MỚI
        if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        } else {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        // 2. THÊM CHỮ "AWAIT" VÀO ĐÂY (Cực kỳ quan trọng)
        // Nếu API gọi lại vẫn lỗi, nó sẽ văng xuống khối catch bên dưới để đá ra Login
        return await axiosClient(originalRequest);

      } catch (refreshError) {
        localStorage.clear();

        window.location.href = '/admin/login';

        return Promise.reject(refreshError);
      }
    }

    // Unauthorized thật sự
    if (error.response?.status === 401) {
      localStorage.clear();

      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

export default axiosClient;