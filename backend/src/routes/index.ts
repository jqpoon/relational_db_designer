import { Router } from 'express';
import AuthRouter from './auth';
import ERDRouter from "./erd";
import CollabRouter from "./collab"
import TranslationRouter from './translation'

import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '../config/swagger.json';

const apiRouter = Router();

apiRouter.use('/erd', ERDRouter);
apiRouter.use('/collab', CollabRouter);
apiRouter.use('/auth', AuthRouter);
apiRouter.use('/translation', TranslationRouter);
apiRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default apiRouter;
