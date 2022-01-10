import { Router } from "express";
import swaggerUi, { JsonObject } from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import AuthRouter from "./auth";
import ERDRouter from "./erd";
import CollabRouter from "./collab";
import TranslationRouter from "./translation";

// API router
const apiRouter = Router();

// Routing of endpoints
apiRouter.use("/auth", AuthRouter);
apiRouter.use("/erd", ERDRouter);
apiRouter.use("/collab", CollabRouter);
apiRouter.use("/translation", TranslationRouter);

// Documentation
const swagger_path = path.resolve(__dirname, "../config/swagger.yaml");
const swaggerDocument: JsonObject = YAML.load(swagger_path);
apiRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default apiRouter;
