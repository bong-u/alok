import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface SignupResponse {
	message: string;
}

const SignupPage: React.FC = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { executeRecaptcha } = useGoogleReCaptcha();

	const handleSignup = async () => {
		if (!executeRecaptcha) {
			console.log("Execute recaptcha not yet available");
			return;
		}
		const recaptchaToken = await executeRecaptcha("signup");

		if (password !== confirmPassword) {
			alert("비밀번호가 일치하지 않습니다.");
			return;
		}

		try {
			const response = await api.post<SignupResponse>("/users/signup", {
				username,
				password,
				recaptchaToken,
			});

			if (response.status === 201) {
				alert("회원가입이 완료되었습니다.");
				navigate("/login", { replace: true });
			}
		} catch (err: any) {
			if (
				err.response &&
				(err.response.status === 400 || err.response.status === 409)
			) {
				alert(err.response.data);
			} else {
				sessionStorage.setItem("error", err.message);
				window.location.reload();
			}
		}
	};

	return (
		<div
			className="container is-flex is-justify-content-center is-align-items-center"
			style={{ minHeight: "100vh" }}
		>
			<div
				className="box"
				style={{ width: "100%", maxWidth: "400px", padding: "20px" }}
			>
				<h1 className="title has-text-centered">회원가입</h1>
				<div className="field">
					<label className="label">계정 이름</label>
					<div className="control">
						<input
							className="input"
							type="text"
							placeholder="사용할 계정 이름을 입력하세요"
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
					<label className="label">비밀번호 확인</label>
					<div className="control">
						<input
							className="input"
							type="password"
							placeholder="비밀번호를 다시 입력하세요"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>
				</div>
				<div className="field">
					<div className="control">
						<button
							className="button is-primary is-fullwidth"
							onClick={handleSignup}
						>
							회원가입
						</button>
					</div>
				</div>
				<div className="field">
					<div className="control">
						<Link
							to="/login"
							className="button is-fullwidth is-info"
						>
							로그인하러 가기
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignupPage;
