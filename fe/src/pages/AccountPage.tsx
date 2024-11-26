import React, { useState, useEffect } from "react";
import api from "../api";
import { User } from "../types";

const AccountPage: React.FC = () => {
	const [username, setUsername] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");

	useEffect(() => {
		const fetchMe = async () => {
			try {
				const response = await api.get<User>("/users/me");
				setUsername(response.data.username);
			} catch (error: any) {
				sessionStorage.setItem("error", error);
				window.location.href = "/error";
			}
		};
		fetchMe();
	});

	const handleLogout = async () => {
		try {
			await api.post("/users/logout", {
				access_token: localStorage.getItem("access_token"),
				refresh_token: localStorage.getItem("refresh_token"),
			});
		} catch (error: any) {
			alert("로그아웃에 실패했습니다.");
			console.error(error);
			return;
		}

		localStorage.removeItem("acccess_token");
		localStorage.removeItem("refresh_token");
		window.location.href = "/login";
	};

	const handleChangePassword = async () => {
		try {
			await api.patch("/users/password", {
				old_password: currentPassword,
				new_password: newPassword,
			});
		} catch (error: any) {
			if (error.response.status === 400) {
				alert(error.response.data);
				return
			}
			sessionStorage.setItem("error", error);
			window.location.href = "/error";
			return;
		}

		alert("비밀번호가 성공적으로 변경되었습니다.");
		setCurrentPassword("");
		setNewPassword("");
	};

	const handleDeleteAccount = async () => {
		if (!window.confirm("정말로 회원 탈퇴를 하시겠습니까?")) {
			return;
		}

		const access_token = localStorage.getItem("access_token");
		const refresh_token = localStorage.getItem("refresh_token");

		if (!access_token || !refresh_token) {
			window.location.href = "/login";
			return;
		}

		try {
			await api.request({
				url: "/users/me",
				method: "DELETE",
				data: {
					access_token,
					refresh_token,
				},
			});
		} catch (error: any) {
			alert("회원 탈퇴에 실패했습니다.");
			console.error(error);
			return;
		}

		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		window.location.href = "/login";
	};

	return (
		<div className="container box">
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-5">
				<h1
					className="subtitle"
					style={{ lineHeight: "40px", height: "20px" }}
				>
					{username}님
				</h1>
				<button
					className="button is-light is-small"
					onClick={handleLogout}
				>
					로그아웃
				</button>
			</div>
			<div className="field">
				<label className="label">이전 비밀번호</label>
				<div className="control">
					<input
						className="input"
						type="password"
						placeholder="이전 비밀번호를 입력하세요"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
					/>
				</div>
			</div>

			<div className="field">
				<label className="label">새로운 비밀번호</label>
				<div className="control">
					<input
						className="input"
						type="password"
						placeholder="새로운 비밀번호를 입력하세요"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
					/>
				</div>
			</div>

			<div className="field">
				<div className="control">
					<button
						className="button is-primary is-fullwidth"
						onClick={handleChangePassword}
					>
						비밀번호 변경
					</button>
				</div>
			</div>

			<div className="field">
				<div className="control">
					<button
						className="button is-danger is-fullwidth"
						onClick={handleDeleteAccount}
					>
						회원 탈퇴
					</button>
				</div>
			</div>
		</div>
	);
};

export default AccountPage;
