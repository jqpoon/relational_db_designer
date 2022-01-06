import React, {useState} from 'react'
import Auth from "./auth";
import Editor from "./editor/editor";

export default function Index() {
	const [user, setUser] = useState(localStorage.getItem('user'));

	return !user ? <Auth setUser={setUser} /> : <Editor user={user} setUser={setUser} />
}
