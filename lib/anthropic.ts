import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic() {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _client;
}

// Shared model used by all analyses. Using claude-sonnet-4-5 per product brief —
// good quality-to-latency for emotional / interpretive copy.
export const ANTHROPIC_MODEL = "claude-sonnet-4-5";

export type ClaudeMessage = Anthropic.MessageCreateParamsNonStreaming["messages"][number];
