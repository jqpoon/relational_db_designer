/*
	TABLE OF CONTENTS

	1. Imports
	2. API router
		2.1 Routing of endpoints
		2.2 Documentation
*/

// 1. Imports
import { Router } from "express";
import swaggerUi, { JsonObject } from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import AuthRouter from "./auth";
import ERDRouter from "./erd";
import CollabRouter from "./collab";
import TranslationRouter from "./translation";

// 2. API router
const apiRouter = Router();

// 2.1 Routing of endpoints
apiRouter.use("/auth", AuthRouter);
apiRouter.use("/erd", ERDRouter);
apiRouter.use("/collab", CollabRouter);
apiRouter.use("/translation", TranslationRouter);

// 2.2 Documentation
const swagger_path = path.resolve(__dirname, "../config/swagger.yaml");
const swaggerDocument: JsonObject = YAML.load(swagger_path);
apiRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default apiRouter;
