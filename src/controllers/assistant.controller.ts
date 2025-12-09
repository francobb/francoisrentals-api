import { NextFunction, Response } from 'express';
import { IRequest } from '@utils/interfaces';
import AssistantService from '@/services/assistant.service';
import ContextBuilderService from '@/services/context.service';

class AssistantController {
  public assistantService = new AssistantService();
  public contextBuilderService = new ContextBuilderService();

  public answerQuestion = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { question } = req.body;

      // 1. Build the context using the new service
      const context = await this.contextBuilderService.buildContext(question);

      // 2. Pass the structured context to the AI service
      const answer = await this.assistantService.queryWithContext(question, context);

      res.status(200).json({ data: answer, message: 'success' });
    } catch (e) {
      next(e);
    }
  };
}

export default AssistantController;
