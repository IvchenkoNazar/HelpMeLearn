import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIGenerateOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private modelName: string;
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(private configService: ConfigService) {
    this.client = new GoogleGenerativeAI(
      this.configService.getOrThrow<string>('ai.gemini.apiKey'),
    );
    this.modelName = this.configService.get<string>('ai.gemini.model', 'gemini-2.0-flash');
  }

  async generate(prompt: string, options: AIGenerateOptions = {}): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2000,
      },
      ...(options.systemPrompt
        ? { systemInstruction: { role: 'system', parts: [{ text: options.systemPrompt }] } }
        : {}),
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) throw new Error('Gemini returned empty response');
    return text;
  }
}
