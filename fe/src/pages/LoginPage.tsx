import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

interface LoginResponse {
	access_token: string;
	refresh_token: string;
}

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await api.get("/users/me");

				if (response.status === 200) navigate("/", { replace: true });
			} catch (error: any) {
				if (
					error.response.status === 401 ||
					error.response.status === 404
				) {
					setIsLoading(false);
					return;
				} else {
					sessionStorage.setItem("error", error);
					window.location.href = "/error";
				}
			}
		};

		fetchUserData();
	}, [navigate]);

	const handleLogin = async () => {
		try {
			const response = await api.post<LoginResponse>("/users/login", {
				username,
				password,
			});
			const { access_token, refresh_token } = response.data;

			localStorage.setItem("access_token", access_token);
			localStorage.setItem("refresh_token", refresh_token);

			navigate("/", { replace: true });
		} catch (err: any) {
			if (err.response && err.response.status === 401) {
				alert("계정 이름 또는 비밀번호가 일치하지 않습니다.");
			} else {
				sessionStorage.setItem("error", err);
				window.location.href = "/error";
			}
		}
	};

	if (isLoading) {
		return null;
	}

	return (
		<div
			className="container is-flex is-justify-content-center is-align-items-center"
			style={{ minHeight: "100vh" }}
		>
			<div
				className="box"
				style={{ width: "100%", maxWidth: "400px", padding: "20px" }}
			>
				<h1 className="title has-text-centered">알록</h1>
				<div className="field">
					<label className="label">계정 이름</label>
					<div className="control">
						<input
							className="input"
							type="text"
							placeholder="계정 이름을 입력하세요"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>
				</div>
				<div className="field">
					<label className="label">비밀번호</label>
					<div className="control">
						<input
							className="input"
							type="password"
							placeholder="비밀번호를 입력하세요"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
				</div>
				<div className="field">
					<div className="control">
						<button
							className="button is-primary is-fullwidth"
							onClick={handleLogin}
						>
							로그인
						</button>
					</div>
				</div>
				<div className="field">
					<div className="control">
						<Link
							to="/signup"
							className="button is-light is-fullwidth"
						>
							회원가입하러 가기
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
