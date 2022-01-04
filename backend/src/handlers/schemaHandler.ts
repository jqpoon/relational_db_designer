import { Server, Socket } from "socket.io";
import ErrorBuilder from "src/controllers/errorBuilder";
import FirebaseController from "src/controllers/firebaseController";
import logger from '@shared/Logger';

function SchemaHandler(io: Server, socket: Socket) {

    const joinSchemaRoom = (data: { erid: string; }) => {

        let erid: string = data.erid;

        // sockets join the erid room
        logger.info("joined room");
        socket.join(erid)
    }

    const updateSchema = (data: { uid: string; erid: string; schema: string; }) => {
        let uid: string = data.uid;
        let erid: string = data.erid;
        let schema = JSON.stringify(data.schema as string)

        logger.info(socket.id);

        FirebaseController.getInstance().updateERD(uid, erid, schema).then(() => {

            // sends to all clients in the erid room the updated data
            io.to(erid).emit("schema updated", {
                socketID: socket.id,
                schema: data.schema
            });

        })
            .catch((error) => {
                if (error instanceof ErrorBuilder) {

                    // sends to socket saying there is an error
                    socket.emit("error", {
                        error_code: error.getCode(),
                        error_msg: error.getMsg()
                    });
                } else {

                    // sends to socket saying there is an error
                    socket.emit("error", {
                        error_code: 501,
                        error_msg: "An error occured. Please try again later"
                    });
                }
            });
    }

    socket.on("update schema", updateSchema);
    socket.on("connect schema", joinSchemaRoom);

}

export default SchemaHandler
