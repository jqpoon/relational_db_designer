// Main component of project

import React, { useState } from "react";
import Auth from "./auth";
import Editor from "./editor/editor";
import {io} from "socket.io-client";

export default function Index() {
	const [user, setUser] = useState(localStorage.getItem('user'));
	const [socket, setSocket] = useState(null);

	if (!user) {
		return <Auth setUser={setUser} />
	} else {
		if (socket === null) {
			const socketIO = io(process.env.REACT_APP_RELATIONAL_DB_DESIGNER_SOCKET_URL);
			setSocket(socketIO);

			socketIO.on("connect", () => {
				console.log("connected")
			})
		}
		return <Editor user={user} setUser={setUser} socket={socket} setSocket={setSocket}/>
	}
}
