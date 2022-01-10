/*
	TABLE OF CONTENTS

	1. Imports
	2. Utility functions
	3. Auth component
		3.1 States
		3.2 Submit handler
		3.3 JSX
*/

// **********
// 1. Imports
// **********

import React, { useState } from "react";
import "./auth.css";

// ********************
// 2. Utility functions
// ********************

const authenticate = async (credentials, isLogin) => {
	const endpoint = `/api/auth/${isLogin ? "login" : "signup"}`;
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(credentials),
	});
	const data = await res.text();
	if (!res.ok) throw new Error(data.split("auth/")[1].split(").")[0]);
	return data;
};

// *****************
// 3. Auth component
// *****************

export default function Auth({ setUser }) {
	// **********
	// 3.1 States
	// **********

	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState(null);
	const [password, setPassword] = useState(null);

	// ******************
	// 3.2 Submit handler
	// ******************

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email || !password) {
			return;
		}

		try {
			const uid = await authenticate(
				{
					email,
					password,
				},
				isLogin
			);
			localStorage.setItem("user", uid);
			setUser(uid);
		} catch (error) {
			alert(error);
		}
	};

	// *******
	// 3.3 JSX
	// *******

	return (
		<div className="limiter">
			<div className="container-auth">
				<div className="wrap-auth">
					<form className="auth-form" onSubmit={handleSubmit}>
						<span className="auth-form-title">Relational DB Designer</span>
						<div className="wrap-input">
							<input
								className="input"
								type="email"
								placeholder="Email"
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="wrap-input">
							<input
								className="input"
								type="password"
								placeholder="Password"
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<div>
							<p className="p-btn" onClick={() => setIsLogin((prev) => !prev)}>
								{isLogin
									? "Don't have an account? Create one here."
									: "Have an account? Login here"}
							</p>
						</div>
						<div className="container-auth-form-btn">
							<button className="auth-form-btn">
								{isLogin ? "Login" : "Sign up"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
