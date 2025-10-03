import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_MODEL = 'gpt-4o-mini';
export const OPENAI_MAX_TOKENS = 150;
export const OPENAI_TEMPERATURE = 0.1; // Low temperature for consistent responses
