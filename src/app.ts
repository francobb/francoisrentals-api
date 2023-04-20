import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS, ROOT_URI } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { frAscii } from '@utils/frAscii';
import payeePayerModel from '@models/payeePayer.model';
import payeePayerJson from './assets/payeePayer.json';
class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.readInAsciiFile();
    this.connectToDatabase();
    this.initPayeePayerData();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    set('strictQuery', false);
    connect(dbConnection.url, dbConnection.options)
      .then(() => {
        logger.info(`🗄 Database Connected`);
        logger.info(`=================================`);
      })
      .catch(err => logger.error(`🔻 Database Connection Error: ${err}`));
  }
  private initPayeePayerData() {
    const payeePayerMap = payeePayerJson.map(p => {
      return { name: p };
    });

    payeePayerModel
      .insertMany(payeePayerMap)
      .then(r => logger.info(`��� Saved payees to database`))
      .catch(err => logger.error(`Error from saving payees & payers ${err}`));
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const swaggerDefinition = {
      openapi: '3.0.0',
      info: {
        title: 'Express API for JSONPlaceholder',
        version: '1.0.0',
        description: 'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
        license: {
          name: 'Licensed Under MIT',
          url: 'https://spdx.org/licenses/MIT.html',
        },
        contact: {
          name: 'JSONPlaceholder',
          url: 'https://jsonplaceholder.typicode.com',
        },
      },
      servers: [
        {
          url: `${ROOT_URI}`,
          description: 'Development server',
        },
      ],
      apis: ['swagger.yaml'],
    };
    const options = {
      swaggerDefinition,
      apis: ['swagger.yaml'],
    };
    const swaggerUiOptions = {
      explorer: true,
    };
    const specs = swaggerJSDoc(options);

    this.app.use(
      '/api-docs',
      (req, res, next) => {
        // const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
        // if (!Authorization) console.log('You need to authenticate, Hor');
        // res.redirect('/error');
        next();
      },
      swaggerUi.serve,
      swaggerUi.setup(specs, swaggerUiOptions),
    );
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private readInAsciiFile() {
    console.info(frAscii);
  }
}

export default App;
