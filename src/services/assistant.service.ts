import { logger } from '@/utils/logger';
import openai from '@clients/openai.client';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { Run } from 'openai/resources/beta/threads/runs/runs';
import { AssistantTool } from 'openai/resources/beta';

const ASSISTANT_ID_FILE = path.join(__dirname, '../../assistant-id.txt');
const CONTEXT_FILE_PATH = path.join(__dirname, '../../context.txt');

class AssistantService {
  private assistantId: string;
  private readonly initializationPromise: Promise<void>;

  constructor() {
    this.initializationPromise = this.initializeAssistant().catch(err => {
      logger.error('Failed to initialize AssistantService:', err);
    });
  }

  public async queryWithContext(question: string, context: string): Promise<string> {
    await this.initializationPromise;
    if (!this.assistantId) {
      throw new Error('Assistant not initialized. Check server logs for initialization errors.');
    }

    const fileId = await this.uploadContext(context);

    try {
      // DEFINITIVE FIX: The `file_ids` parameter is removed entirely.
      // The retrieval tool finds the file automatically based on its 'purpose'.
      const run = await openai.beta.threads.createAndRun({
        assistant_id: this.assistantId,
        thread: {
          messages: [
            {
              role: 'user',
              content: question,
              attachments: [
                {
                  file_id: fileId,
                  tools: [{ type: 'code_interpreter' }],
                },
              ],
            },
          ],
        },
      });

      let runStatus: Run = await openai.beta.threads.runs.retrieve(run.id, { thread_id: run.thread_id });
      while (['queued', 'in_progress'].includes(runStatus.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: run.thread_id });
      }

      if (runStatus.status !== 'completed') {
        const errorMessage = runStatus.last_error?.message ?? 'No error message provided.';
        logger.error(`Run failed with status: ${runStatus.status}. Reason: ${errorMessage}`);
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }

      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const lastMessage = messages.data.find(m => m.role === 'assistant');

      if (lastMessage) {
        for (const contentBlock of lastMessage.content) {
          if (contentBlock.type === 'text') {
            return contentBlock.text.value;
          }
        }
      }

      return 'The assistant did not provide a text response.';
    } finally {
      await openai.files.delete(fileId);
      logger.info(`Deleted temporary file ${fileId} from OpenAI storage.`);
    }
  }

  private async uploadContext(context: string): Promise<string> {
    await fs.writeFile(CONTEXT_FILE_PATH, context);
    const file = await openai.files.create({
      file: createReadStream(CONTEXT_FILE_PATH),
      purpose: 'assistants',
    });
    logger.info(`Uploaded context file with ID: ${file.id}`);
    return file.id;
  }

  private async initializeAssistant() {
    try {
      const assistantIdFromFile = await fs.readFile(ASSISTANT_ID_FILE, 'utf-8');
      if (assistantIdFromFile && assistantIdFromFile.trim()) {
        this.assistantId = assistantIdFromFile.trim();
        logger.info(`Found existing assistant with ID: ${this.assistantId}`);
        await this.updateAssistant();
      } else {
        throw new Error('ENOENT');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.info('No assistant ID found or file is empty, creating a new assistant...');
        await this.createAssistant();
      } else {
        throw error;
      }
    }
  }

  private getAssistantInstructions(): string {
    return `You are a highly skilled real estate data analyst for Francois Rentals. Your primary goal is to answer questions based on the context provided in the attached file.
      **CRITICAL INSTRUCTIONS:**
      1.  **Trust the Provided File:** The attached file is your single source of truth.
      2.  **Adhere to the Rules:** The file begins with a set of rules. Follow these rules strictly.
      3.  **Be Concise:** Answer the user's question directly.
      4.  **Handle Missing Data:** If you cannot find an answer in the provided data, state that clearly.`;
  }

  private getTools(): AssistantTool[] {
    return [{ type: 'code_interpreter' }];
  }

  private async createAssistant() {
    const assistant = await openai.beta.assistants.create({
      name: 'Francois Rentals Analyst',
      instructions: this.getAssistantInstructions(),
      model: 'gpt-4-turbo-preview',
      tools: this.getTools(),
    });
    this.assistantId = assistant.id;
    await fs.writeFile(ASSISTANT_ID_FILE, this.assistantId);
    logger.info(`Created a new assistant with ID: ${this.assistantId}`);
  }

  private async updateAssistant() {
    if (!this.assistantId) return;
    await openai.beta.assistants.update(this.assistantId, {
      instructions: this.getAssistantInstructions(),
      tools: this.getTools(),
    });
    logger.info(`Updated instructions and tools for assistant ID: ${this.assistantId}`);
  }
}

export default AssistantService;
