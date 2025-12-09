 import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import AssistantController from '@controllers/assistant.controller';
import { apiKeyMiddleware } from '@middlewares/auth.middleware';

class AssistantRoute implements Routes {
  public path = '/assistant';
  public router = Router();
  public assistantController = new AssistantController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/question`, this.assistantController.answerQuestion);
  }
}

export default AssistantRoute;
