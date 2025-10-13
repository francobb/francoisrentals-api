import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import passport from 'passport';
import '@clients/passport.client';
import TenantService from '@services/tenants.service';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import errorMiddleware from '@middlewares/error.middleware';
import { CREDENTIALS, LOG_FORMAT, NODE_ENV, ORIGIN, PORT, ROOT_URI } from '@config';
import { Routes } from '@interfaces/routes.interface';
import { AppDataSource, } from '@databases';
import { frAscii } from '@utils/frAscii';
import { logger, stream } from '@utils/logger';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public tenantService: TenantService;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.tenantService = new TenantService();

    this.readInAsciiFile();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    // First, connect to the database, then start listening.
    this.connectToPostgres().then(() => {
      this.app.listen(this.port, () => {
        logger.info(`=================================`);
        logger.info(`======= ENV: ${this.env} =======`);
        logger.info(`🚀 App listening on port ${this.port}`);
        logger.info(`=================================`);
      });
    });
  }

  public getServer() {
    return this.app;
  }

  private async connectToPostgres() {
    try {
      await AppDataSource.initialize();
      logger.info('🗄 PostgreSQL Database Connected');
    } catch (err) {
      logger.error(`🔻 Database Connection Error: ${err}`);
    }
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());

    // used to transform stripe webhook response
    // this.app.use('/payment/stripe', express.raw({ type: '*/*' }));
    this.app.use(
      express.json({
        limit: '5mb',
        verify: (req, res, buf) => {
          (req as any).rawBody = buf.toString();
        },
      }),
    );
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(passport.initialize());
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
        title: 'API for Francois Rentals',
        version: '1.0.0',
        description: 'This is the Swagger UI for Francois Rentals.',
        license: {
          name: 'Licensed Under MIT',
          url: 'https://spdx.org/licenses/MIT.html',
        },
      },
      servers: [
        {
          url: `${ROOT_URI}`,
          description: ROOT_URI.indexOf('localhost') != -1 ? 'Development' : 'Production',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT', // Modify this according to your token format
          },
        },
      },
      security: [
        {
          BearerAuth: [], // This indicates that the BearerAuth security scheme should be applied to all operations
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

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private readInAsciiFile() {
    console.info(frAscii);
  }
}

export default App;
