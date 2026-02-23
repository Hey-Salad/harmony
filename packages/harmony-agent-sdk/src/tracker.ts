import { HarmonyTrackerConfig, RuntimeMetrics, SessionInfo, ADKEvent } from './types';
import { calculateCost } from './pricing';

export class HarmonyTracker {
  private config: Required<HarmonyTrackerConfig>;
  private pendingMetrics: RuntimeMetrics = {};
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private currentSessionId: string | null = null;

  constructor(config: HarmonyTrackerConfig) {
    this.config = {
      ...config,
      modelName: config.modelName || 'unknown',
      flushIntervalMs: config.flushIntervalMs || 10_000,
    };
  }

  /**
   * Wrap any async function - automatically tracks duration, catches errors,
   * and reports metrics to Harmony.
   */
  async track<T>(taskId: string, fn: () => Promise<T>): Promise<T> {
    const sessionId = await this.startSession(taskId);
    try {
      const result = await fn();
      await this.endSession(sessionId);
      return result;
    } catch (error) {
      await this.endSession(sessionId, { error_count: 1 });
      throw error;
    }
  }

  /**
   * Start a new work session for this agent.
   */
  async startSession(taskId: string, taskDescription?: string): Promise<string> {
    const response = await this.apiCall('POST', '/api/sessions/start', {
      worker_id: this.config.agentId,
      task_id: taskId,
      task_description: taskDescription,
      model_version: this.config.modelName,
    });

    const data = await response.json() as { session: SessionInfo };
    this.currentSessionId = data.session.id;
    this.pendingMetrics = {};
    this.startFlushTimer();
    return data.session.id;
  }

  /**
   * Report incremental metrics for the current session.
   */
  async reportMetrics(sessionId: string, metrics: RuntimeMetrics): Promise<void> {
    // Accumulate metrics locally for batched sending
    this.pendingMetrics.tokens_input = (this.pendingMetrics.tokens_input || 0) + (metrics.tokens_input || 0);
    this.pendingMetrics.tokens_output = (this.pendingMetrics.tokens_output || 0) + (metrics.tokens_output || 0);
    this.pendingMetrics.api_calls_count = (this.pendingMetrics.api_calls_count || 0) + (metrics.api_calls_count || 0);
    this.pendingMetrics.error_count = (this.pendingMetrics.error_count || 0) + (metrics.error_count || 0);

    // Auto-calculate cost from tokens if model is known
    if (metrics.tokens_input || metrics.tokens_output) {
      const cost = calculateCost(
        this.config.modelName,
        metrics.tokens_input || 0,
        metrics.tokens_output || 0,
      );
      this.pendingMetrics.cost_incurred = (this.pendingMetrics.cost_incurred || 0) + cost;
    }
  }

  /**
   * End a session and flush all remaining metrics.
   */
  async endSession(sessionId: string, finalMetrics?: RuntimeMetrics): Promise<void> {
    this.stopFlushTimer();

    // Merge any final metrics with pending
    const metrics = { ...this.pendingMetrics };
    if (finalMetrics) {
      metrics.tokens_input = (metrics.tokens_input || 0) + (finalMetrics.tokens_input || 0);
      metrics.tokens_output = (metrics.tokens_output || 0) + (finalMetrics.tokens_output || 0);
      metrics.api_calls_count = (metrics.api_calls_count || 0) + (finalMetrics.api_calls_count || 0);
      metrics.error_count = (metrics.error_count || 0) + (finalMetrics.error_count || 0);
      metrics.cost_incurred = (metrics.cost_incurred || 0) + (finalMetrics.cost_incurred || 0);
    }

    await this.apiCall('POST', `/api/sessions/${sessionId}/end`, metrics);
    this.currentSessionId = null;
    this.pendingMetrics = {};
  }

  /**
   * Create an event handler for ADK events that automatically extracts
   * token usage from usage_metadata.
   */
  createEventHandler(): (event: ADKEvent) => void {
    return (event: ADKEvent) => {
      if (!this.currentSessionId) return;

      if (event.usage_metadata) {
        const metrics: RuntimeMetrics = {
          tokens_input: event.usage_metadata.prompt_token_count || 0,
          tokens_output: event.usage_metadata.candidates_token_count || 0,
          api_calls_count: 1,
        };
        this.reportMetrics(this.currentSessionId, metrics);
      }
    };
  }

  private startFlushTimer(): void {
    this.stopFlushTimer();
    this.flushTimer = setInterval(() => this.flush(), this.config.flushIntervalMs);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private async flush(): Promise<void> {
    if (!this.currentSessionId || !this.hasPendingMetrics()) return;

    const metrics = { ...this.pendingMetrics };
    this.pendingMetrics = {};

    try {
      await this.apiCall('POST', `/api/sessions/${this.currentSessionId}/heartbeat`, metrics);
    } catch (error) {
      // Re-add metrics on failure so they aren't lost
      this.pendingMetrics.tokens_input = (this.pendingMetrics.tokens_input || 0) + (metrics.tokens_input || 0);
      this.pendingMetrics.tokens_output = (this.pendingMetrics.tokens_output || 0) + (metrics.tokens_output || 0);
      this.pendingMetrics.api_calls_count = (this.pendingMetrics.api_calls_count || 0) + (metrics.api_calls_count || 0);
      this.pendingMetrics.cost_incurred = (this.pendingMetrics.cost_incurred || 0) + (metrics.cost_incurred || 0);
      console.error('[HarmonyTracker] Flush failed, metrics will be retried:', error);
    }
  }

  private hasPendingMetrics(): boolean {
    return Object.values(this.pendingMetrics).some((v) => v && v > 0);
  }

  private async apiCall(method: string, path: string, body?: any): Promise<Response> {
    const url = `${this.config.apiUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Harmony API error ${response.status}: ${text}`);
    }

    return response;
  }
}
