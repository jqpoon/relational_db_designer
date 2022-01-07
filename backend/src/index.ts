import app from '@server';
import logger from '@shared/Logger';
import {createServer} from "http";
import {Server} from "socket.io";
import SchemaHandler from './handlers/schemaHandler';
import {io} from "socket.io-client";

// Start the server
const port = Number(process.env.PORT || 3000);

const httpServer = createServer(app);
const ioServer = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

ioServer.on("connection", (socket) => {
    logger.info('Client connected');
    logger.info(socket.id);
    SchemaHandler(ioServer, socket);

    socket.on("disconnect", (reason) => {
        // sockets leaves all rooms
        for (var room of socket.rooms) {
            socket.leave(room)
        }
        logger.info('Client disconnected');
    })
});

httpServer.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});

