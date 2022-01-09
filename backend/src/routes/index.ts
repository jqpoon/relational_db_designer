import { Router } from 'express';
import AuthRouter from './auth';
import ERDRouter from "./erd";
import CollabRouter from "./collab"
import TranslationRouter from './translation'

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import path from 'path';

var swagger_path = path.resolve(__dirname,'../config/swagger.yaml');
const swaggerDocument = YAML.load(swagger_path);

const apiRouter = Router();

apiRouter.use('/erd', ERDRouter);
apiRouter.use('/collab', CollabRouter);
apiRouter.use('/auth', AuthRouter);
apiRouter.use('/translation', TranslationRouter);
apiRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default apiRouter;
