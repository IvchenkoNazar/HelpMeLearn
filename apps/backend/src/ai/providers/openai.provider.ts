import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AIProvider, AIGenerateOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;
  private readonly logger = new Logger(OpenAIProvider.name);

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('ai.openai.apiKey'),
    });
    this.model = this.configService.get<string>('ai.openai.model', 'gpt-4o');
  }

  async generate(prompt: string, options: AIGenerateOptions = {}): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('OpenAI returned empty response');
    return content;
  }
}
