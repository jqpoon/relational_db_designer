import React, { useState } from 'react';
import "./auth.css";

const ping = async (credentials, isLogin) => {
	const endpoint = `/api/auth/${isLogin ? "login" : "signup"}`
	const res = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(credentials)
	});
	const data = await res.text();
	if (!res.ok) throw new Error(data.split("auth/")[1].split(").")[0]);
	return data;
 }
 

export default function Auth({setUser}) {
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState(null);
	const [password, setPassword] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email || !password) {
			return;
		}

		try {
			const uid = await ping({
				email,
				password
			}, isLogin);
			setUser(uid);
		} catch (error) {
			alert(error);
		}
	}

	return (
		<div className="limiter">
			<div className="container-auth">
				<div className="wrap-auth">
					<form className="auth-form" onSubmit={handleSubmit}>
						<span className="auth-form-title">
							Relational DB Designer
						</span>
						<div className="wrap-input">
							<input 
								className="input" 
								type="email" 
								placeholder="Email" 
								onChange={e => setEmail(e.target.value)}
							/>
						</div>
						<div className="wrap-input">
							<input 
								className="input"
								type="password"
								placeholder="Password"
								onChange={e => setPassword(e.target.value)}
							/>
						</div>
						<div>
							<p className="p-btn" onClick={() => setIsLogin(prev => !prev)}>
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
	)
}
