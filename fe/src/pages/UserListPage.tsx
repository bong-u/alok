import React, { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { User } from "../types";

const UserListPage: React.FC = () => {
	const [userId, setUserId] = useState<number | null>(null);
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		const fetchMe = async () => {
			try {
				const response = await api.get<User>("/users/me");

				if (response.status !== 200) {
					throw new Error("Failed to fetch me");
				}
				setUserId(response.data.id);
			} catch (error: any) {
				if (error.response?.status === 401) {
					return;
				} else {
					sessionStorage.setItem("error", error);
					window.location.href = "/error";
				}
			}
		};
		const fetchUsers = async () => {
			try {
				const response = await api.get<User[]>("/users/all");

				if (response.status !== 200) {
					throw new Error("Failed to fetch users");
				}
				setUsers(response.data);
			} catch (error: any) {
				if (error.response?.status === 401) {
					return;
				} else {
					sessionStorage.setItem("error", error);
					window.location.href = "/error";
				}
			}
		};

		fetchMe();
		fetchUsers();
	}, []);

	return (
		<div className="container">
			<div className="box">
				<h1 className="subtitle has-text-centered">사용자 명단</h1>
				{users.map((user) =>
					user.id === userId ? (
						// 본인인 경우
						<button
							key={user.id}
							className="button is-fullwidth is-success mb-3"
							disabled
						>
							{user.username} (나)
						</button>
					) : (
						<Link
							key={user.id}
							to={`/users/${user.id}`}
							state={{ username: user.username }}
							className="button is-fullwidth is-primary is-light mb-3"
						>
							{user.username}
						</Link>
					)
				)}
			</div>
		</div>
	);
};

export default UserListPage;
