import { Global, Module } from '@nestjs/common';
import { OpenAIProvider } from './providers/openai.provider';
import { BedrockProvider } from './providers/bedrock.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AIProviderFactory } from './ai-provider.factory';
import { AIService } from './ai.service';

@Global()
@Module({
  providers: [OpenAIProvider, BedrockProvider, GeminiProvider, AIProviderFactory, AIService],
  exports: [AIService],
})
export class AIModule {}
