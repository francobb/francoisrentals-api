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
import TenantService from '@services/tenants.service';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public tenantService;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.tenantService = new TenantService();

    this.readInAsciiFile();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on port ${this.port}`);
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

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    // todo: add url to url obj
    // this.app.use('/payment/stripe', express.raw({ type: '*/*' }));
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
          description: 'Development server',
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

  public async updateRentalBalance() {
    const tenants = await this.tenantService.findAllTenants();
    const currentDate = new Date();
    const isFirstDayOfMonth = currentDate.getDate() === 1;

    if (isFirstDayOfMonth) {
      for (const tnt of tenants) {
        logger.info('Updating rental amount for tenant ' + tnt.name);
        tnt.rentalBalance += tnt.rentalAmount;
        await this.tenantService.updateTenant(tnt._id, { rentalBalance: tnt.rentalBalance });
      }
    }
  }
}

export default App;
