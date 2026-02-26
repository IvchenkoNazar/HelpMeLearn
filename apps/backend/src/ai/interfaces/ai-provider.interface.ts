export interface AIGenerateOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  generate(prompt: string, options?: AIGenerateOptions): Promise<string>;
}
