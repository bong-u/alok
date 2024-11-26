import axios from "axios";

const api = axios.create({
	baseURL: process.env.REACT_APP_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// 로컬 스토리지에서 액세스 토큰 가져오기
const getAccessToken = (): string | null => {
	return localStorage.getItem("access_token");
};

// 로컬 스토리지에서 리프레시 토큰 가져오기
const getRefreshToken = (): string | null => {
	return localStorage.getItem("refresh_token");
};

// 액세스 토큰 갱신하기
const refreshAccessToken = async (): Promise<string | null> => {
	const refreshToken = getRefreshToken();
	if (!refreshToken) return null;

	try {
		const response = await axios.post<{ access_token: string }>(
			`${process.env.REACT_APP_API_URL}/users/refresh`,
			{ refresh_token: refreshToken },
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const newAccessToken = response.data.access_token;

		// 새로운 액세스 토큰을 로컬 스토리지에 저장
		localStorage.setItem("access_token", newAccessToken);

		return newAccessToken;
	} catch (error) {
		console.error("Failed to refresh access token:", error);
		return null;
	}
};

// `Authorization` 헤더 자동 설정
api.interceptors.request.use((config) => {
	const token = getAccessToken();
	if (
		token &&
		config.url !== "/users/login" &&
		config.url !== "/users/refresh"
	) {
		if (config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		} else {
			config.headers = {
				Authorization: `Bearer ${token}`,
			} as axios.AxiosRequestHeaders;
		}
	}
	return config;
});

// 401 에러 처리 및 액세스 토큰 갱신
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			// 액세스 토큰 갱신 시도
			const newAccessToken = await refreshAccessToken();

			if (newAccessToken) {
				// 새로운 액세스 토큰으로 요청 재시도
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				return api(originalRequest);
			} else {
				// 리프레시 토큰 갱신 실패 시 로그인 페이지로 이동
				if (window.location.pathname !== "/login") {
					window.location.href = "/login";
				}
			}
		} else if (
			error.response.status >= 500 &&
			error.response.status < 600
		) {
			sessionStorage.setItem("error", error.response);
			window.location.href = "/error";
		}

		return Promise.reject(error);
	}
);

export default api;
