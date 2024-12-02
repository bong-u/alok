import React, { useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Outlet,
} from "react-router-dom";
import MyCalendarPage from "./pages/MyCalendarPage";
import UserCalendarPage from "./pages/UserCalendarPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserListPage from "./pages/UserListPage";
import MyStatsPage from "./pages/MyStatsPage";
import AccountPage from "./pages/AccountPage";
import ErrorPage from "./pages/ErrorPage";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import "./css/App.css";
import { init, destroy } from "pulltorefreshjs";

const Layout: React.FC = () => {
	const offLineHandler = () => {
		alert("인터넷 연결이 끊겼습니다.");
	};

	window.addEventListener("offline", offLineHandler);

	useEffect(() => {
		return () => {
			window.removeEventListener("offline", offLineHandler);
		};
	});

	return (
		<div className="App is-flex is-justify-content-center">
			<div className="box is-flex-grow-1" style={{ overflow: "auto" }}>
				<Outlet />
			</div>
			<nav className="navbar is-fixed-bottom is-light">
				<div className="navbar-menu is-active">
					<div className="navbar-start is-flex is-justify-content-space-around">
						<Link to="/" className="button is-primary">
							달력
						</Link>
						<Link to="/users" className="button is-primary">
							사용자
						</Link>
						<Link to="/stats" className="button is-primary">
							통계
						</Link>
						<Link to="/account" className="button is-primary">
							계정
						</Link>
					</div>
				</div>
			</nav>
		</div>
	);
};

const App: React.FC = () => {
	useEffect(() => {
		init({
			triggerElement: "body", // body에서 Pull-to-Refresh 감지
			distThreshold: 70, // 끌어야 할 거리
			instructionsPullToRefresh: "",
			instructionsReleaseToRefresh: "",
			instructionsRefreshing: "",
			onRefresh: async () => {
				window.location.reload();
			},
		});

		return () => {
			destroy(); // 컴포넌트가 언마운트되면 제거
		};
	}, []);

	return (
		<GoogleReCaptchaProvider
			reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || ""}
		>
			<Router>
				<Routes>
					<Route element={<Layout />}>
						<Route path="/" element={<MyCalendarPage />} />
						<Route path="/users" element={<UserListPage />} />
						<Route
							path="/users/:userId"
							element={<UserCalendarPage />}
						/>
						<Route path="/stats" element={<MyStatsPage />} />
						<Route path="/account" element={<AccountPage />} />
					</Route>

					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
					<Route
						path="/error"
						element={<ErrorPage message="오류가 발생했습니다." />}
					/>
				</Routes>
			</Router>
		</GoogleReCaptchaProvider>
	);
};

export default App;
