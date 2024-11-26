import React, { useEffect } from "react";

interface ErrorPageProps {
	message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message }) => {
	useEffect(() => {
		const errorMsg = sessionStorage.getItem("error");
		if (!errorMsg) {
			window.location.href = "/login";
		}
	}, []);

	const handleGoBack = () => {
		localStorage.removeItem("access-token");
		localStorage.removeItem("refresh-token");
		window.location.href = "/login";
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
				<h1 className="title has-text-centered has-text-danger">
					Error
				</h1>
				<p className="has-text-centered">
					{sessionStorage.getItem("error")}
				</p>
				<div className="field mt-5">
					<div className="control">
						<button
							className="button is-primary is-fullwidth"
							onClick={handleGoBack}
						>
							돌아가기
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ErrorPage;
