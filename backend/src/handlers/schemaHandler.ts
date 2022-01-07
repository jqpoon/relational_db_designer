import { Server, Socket } from "socket.io";
import ErrorBuilder from "../controllers/errorBuilder";
import FirebaseController from "../controllers/firebaseController";
import logger from '@shared/Logger';

function SchemaHandler(io: Server, socket: Socket) {

    const joinSchemaRoom = (data: { erid: string; }) => {

        let erid: string = data.erid;

        // sockets join the erid room
        socket.join(erid)
    }

    const leaveAllSchemaRoom = () => {

        var rooms = io.sockets.adapter.sids.get(socket.id);

        for (var room in rooms) {
            socket.leave(room);
        }
    }

    const reloadSchema = (json: { uid: string; erid: string; }) => {
        let uid: string = json.uid;
        let erid: string = json.erid;

        FirebaseController.getInstance().getERD(uid, erid).then((d) => {
            socket.emit("schema reloaded", {
                body: JSON.parse(d),
            });
        })
    }

    const updateSchema = (json: { uid: string; erid: string; body: any; }) => {
        let uid: string = json.uid;
        let erid: string = json.erid;
        let data = JSON.stringify(json.body as string)

        FirebaseController.getInstance().updateERD(uid, erid, data).then((d) => {

            // sends to all clients in the erid room the updated data
            json.body.counter++;
            io.to(erid).emit("schema updated", {
                socketID: socket.id,
                body: json.body
            });

        })
            .catch((error) => {
                if (error instanceof ErrorBuilder) {

                    // sends to socket saying there is an error
                    socket.emit("error", {
                        socketID: socket.id,
                        error_code: error.getCode(),
                        error_msg: error.getMsg()
                    });
                } else {

                    // sends to socket saying there is an error
                    socket.emit("error", {
                        socketID: socket.id,
                        error_code: 501,
                        error_msg: "An error occured. Please try again later"
                    });
                }
            });
    }

    socket.on("update schema", updateSchema);
    socket.on("connect schema", joinSchemaRoom);
    socket.on("leave all", leaveAllSchemaRoom);
    socket.on("reload schema", reloadSchema);
}

export default SchemaHandler
