import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from './providers/openai.provider';
import { BedrockProvider } from './providers/bedrock.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AIProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class AIProviderFactory {
  constructor(
    private configService: ConfigService,
    private openaiProvider: OpenAIProvider,
    private bedrockProvider: BedrockProvider,
    private geminiProvider: GeminiProvider,
  ) {}

  getProvider(): AIProvider {
    const name = this.configService.get<string>('ai.defaultProvider', 'bedrock');
    const providers: Record<string, AIProvider> = {
      openai: this.openaiProvider,
      bedrock: this.bedrockProvider,
      gemini: this.geminiProvider,
    };
    return providers[name] ?? this.bedrockProvider;
  }
}
