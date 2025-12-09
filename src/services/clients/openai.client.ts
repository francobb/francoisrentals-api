import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Make sure OPENAI_API_KEY is set in your environment variables.');
    }
    // DEFINITIVE FIX: Add a timeout to the client configuration.
    client = new OpenAI({
      apiKey,
      timeout: 120 * 1000, // 2 minutes
    });
  }
  return client;
}

// This is a proxy object. The actual client is only created when a property on it is accessed.
const openai = new Proxy(
  {},
  {
    get: (target, prop) => {
      return Reflect.get(getClient(), prop);
    },
  },
) as OpenAI;

export default openai;
