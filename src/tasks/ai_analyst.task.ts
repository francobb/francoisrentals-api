import ContextBuilderService from '@services/context.service';
import AssistantService from '@services/assistant.service';
import { logger } from '@utils/logger';

/**
 * A proactive AI task that asks a predefined, high-value question
 * about the state of the business and logs the AI's analysis.
 */
export const runAiAnalystTask = async () => {
  logger.info('[AIAssistantTask] Starting proactive analysis...');

  const contextBuilder = new ContextBuilderService();
  const assistant = new AssistantService();

  // Define the high-value question for the AI to answer.
  // We can expand this to a list of questions in the future.
  const question = "Which tenants are currently more than 5 days late on this month's rent?";

  try {
    // Build the context just like our controller does.
    // The ContextBuilderService will automatically find all relevant data.
    const context = await contextBuilder.buildContext(question);

    // Query the assistant with the structured context.
    const answer = await assistant.queryWithContext(question, context);

    logger.info(`[AIAssistantTask] Proactive Analysis Complete. Insight found:`);
    logger.info(`[AIAssistantTask] Question: ${question}`);
    logger.info(`[AIAssistantTask] Answer: ${answer}`);
  } catch (error) {
    logger.error('[AIAssistantTask] The proactive analysis task failed.', error);
  }
};
