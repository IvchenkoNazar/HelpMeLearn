import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { AIProvider, AIGenerateOptions } from '../interfaces/ai-provider.interface';

@Injectable()
export class BedrockProvider implements AIProvider {
  private client: BedrockRuntimeClient;
  private modelId: string;
  private readonly logger = new Logger(BedrockProvider.name);

  constructor(private configService: ConfigService) {
    this.client = new BedrockRuntimeClient({
      region: this.configService.getOrThrow<string>('ai.bedrock.region'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('ai.bedrock.accessKeyId'),
        secretAccessKey: this.configService.getOrThrow<string>('ai.bedrock.secretAccessKey'),
      },
    });
    this.modelId = this.configService.get<string>(
      'ai.bedrock.modelId',
      'anthropic.claude-3-5-sonnet-20241022-v2:0',
    );
  }

  async generate(prompt: string, options: AIGenerateOptions = {}): Promise<string> {
    const body = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: options.maxTokens ?? 2000,
      temperature: options.temperature ?? 0.7,
      messages: [{ role: 'user', content: prompt }],
      ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    });

    const response = await this.client.send(command);
    const decoded = new TextDecoder().decode(response.body);
    const parsed = JSON.parse(decoded);
    const content = parsed?.content?.[0]?.text;
    if (!content) throw new Error('Bedrock returned empty response');
    return content;
  }
}
