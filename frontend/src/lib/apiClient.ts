/**
 * Unified API Client with WebSocket integration and failover
 * Following the architectural design for optimal performance and resilience
 */

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  cache?: boolean;
  timeout?: number;
}

interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number;
}

class APIClient {
  private baseURL: string;
  private mockMode: boolean = false;
  private cache = new Map<string, CachedResponse>();
  private pending = new Map<string, Promise<any>>();
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Auto-detect if backend is available
    this.detectBackendHealth();
  }
  
  private async detectBackendHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/status`, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      this.mockMode = !response.ok;
    } catch (error) {
      console.warn('Backend not available, switching to mock mode');
      this.mockMode = true;
    }
  }
  
  private getCacheKey(endpoint: string, options: RequestOptions): string {
    return `${endpoint}_${JSON.stringify(options)}`;
  }
  
  private getCachedResponse(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  private setCachedResponse(key: string, data: any, ttl: number = 30000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  private shouldFailover(error: any): boolean {
    return error.name === 'TypeError' || // Network error
           error.name === 'AbortError' || // Timeout
           (error.status >= 500 && error.status < 600); // Server error
  }
  
  private async realRequest(endpoint: string, options: RequestOptions): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(options.timeout || 10000)
    };
    
    if (options.body && options.method !== 'GET') {
      requestConfig.body = JSON.stringify(options.body);
    }
    
    const response = await fetch(url, requestConfig);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  private async mockRequest(endpoint: string, options: RequestOptions): Promise<any> {
    // Fallback mock data based on endpoint patterns
    const mockDelay = Math.random() * 200 + 50; // 50-250ms delay
    await new Promise(resolve => setTimeout(resolve, mockDelay));
    
    if (endpoint.includes('/api/real-agents')) {
      return {
        agents: [
          {
            id: 'claude-primary',
            name: 'Claude Archmagus',
            type: 'claude',
            version: 'v4.1.0',
            status: 'active',
            efficiency: 94,
            tasks: 1247,
            accuracy: 98,
            lastUpdate: Date.now()
          }
        ],
        pool_status: {
          pool_size: 3,
          total_completed: 1247,
          pool_efficiency: 94.2
        }
      };
    }
    
    if (endpoint.includes('/api/status')) {
      return { status: 'Mock mode - backend unavailable' };
    }
    
    return { success: true, mock: true };
  }
  
  async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint, options);
    
    // Check cache for GET requests
    if (options.cache !== false && (!options.method || options.method === 'GET')) {
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Request deduplication
    if (this.pending.has(cacheKey)) {
      return this.pending.get(cacheKey);
    }
    
    const requestPromise = this.executeRequest(endpoint, options, cacheKey);
    this.pending.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pending.delete(cacheKey);
    }
  }
  
  private async executeRequest(endpoint: string, options: RequestOptions, cacheKey: string): Promise<any> {
    try {
      if (this.mockMode) {
        return await this.mockRequest(endpoint, options);
      }
      
      const result = await this.realRequest(endpoint, options);
      
      // Cache successful GET responses
      if (!options.method || options.method === 'GET') {
        this.setCachedResponse(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      if (this.shouldFailover(error)) {
        console.warn(`Request failed, using fallback: ${error.message}`);
        // Try cached data first
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached.data;
        }
        // Fall back to mock data
        return await this.mockRequest(endpoint, options);
      }
      throw error;
    }
  }
}

// WebSocket Transport Layer
class WebSocketTransport {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: string[] = [];
  private eventHandlers = new Map<string, Set<(...args: any[]) => void>>();
  
  private url: string;
  private isConnecting = false;
  
  constructor(url: string = 'ws://localhost:3001/ws/terminal') {
    this.url = url;
    // Don't auto-connect in constructor to avoid immediate errors
  }
  
  connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve();
    }
    
    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.emit('connected');
          resolve();
        };
        
        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected');
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
        
        this.ws.onerror = (error) => {
          // Improve error logging for debugging
          console.error('WebSocket error:', {
            url: this.url,
            readyState: this.ws?.readyState,
            error: error instanceof Event ? 'Connection failed' : error
          });
          this.isConnecting = false;
          this.emit('error', error);
          // Don't reject on connection errors, let it retry
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
            resolve(); // Resolve to prevent unhandled rejection
          } else {
            reject(new Error('WebSocket connection failed after max retries'));
          }
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit('message', data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  
  private scheduleReconnect() {
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.connect(), delay);
  }
  
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }
  
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(message);
      }
    }
  }
  
  send(data: any) {
    const message = JSON.stringify(data);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      if (!this.isConnecting) {
        this.connect().catch(console.error);
      }
    }
  }
  
  on(event: string, handler: (...args: any[]) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }
  
  off(event: string, handler: (...args: any[]) => void) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  
  private emit(event: string, ...args: any[]) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }
  
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Domain-specific API services
class AgentAPI extends APIClient {
  async getRealAgents() {
    // Use the correct endpoint that exists in the backend
    return this.request('/api/agents', {
      method: 'GET',
      cache: true
    });
  }
  
  async initializeAgents(apiKey: string) {
    return this.request('/api/real-agents/initialize', {
      method: 'POST',
      body: { api_key: apiKey },
      cache: false
    });
  }
  
  async executeTask(taskId: string, prompt: string, maxTokens: number = 4000) {
    return this.request('/api/real-agents/execute-task', {
      method: 'POST',
      body: { task_id: taskId, prompt, max_tokens: maxTokens },
      cache: false
    });
  }
  
  async deployPod(config: any) {
    return this.request('/api/pods/deploy', {
      method: 'POST',
      body: config,
      cache: false
    });
  }
  
  async getAnalytics() {
    return this.request('/api/analytics/global', {
      method: 'GET',
      cache: true
    });
  }
}

// Agent WebSocket Service
class AgentWebSocketService {
  private transport: WebSocketTransport;
  private subscriptions = new Map<string, Set<(...args: any[]) => void>>();
  
  constructor() {
    this.transport = new WebSocketTransport();
    this.setupEventHandlers();
    
    // Delayed auto-connect to avoid immediate connection errors
    setTimeout(() => {
      this.transport.connect().catch(error => {
        console.warn('Initial WebSocket connection failed, will retry:', error.message);
      });
    }, 1000);
  }
  
  private setupEventHandlers() {
    this.transport.on('message', (data: any) => {
      const { type, ...payload } = data;
      this.emit(type, payload);
    });
    
    this.transport.on('connected', () => {
      console.log('Agent WebSocket service connected');
    });
    
    this.transport.on('disconnected', () => {
      console.log('Agent WebSocket service disconnected');
    });
  }
  
  subscribeToAgentUpdates(callback: (data: any) => void) {
    this.subscribe('agent_update', callback);
    this.subscribe('agent_status', callback);
  }
  
  subscribeToTaskProgress(callback: (data: any) => void) {
    this.subscribe('task_progress', callback);
    this.subscribe('command_complete', callback);
  }
  
  executeCommand(command: string, commandId?: string) {
    this.transport.send({
      type: 'execute',
      command,
      commandId: commandId || Date.now().toString()
    });
  }
  
  private subscribe(event: string, callback: (...args: any[]) => void) {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }
    this.subscriptions.get(event)!.add(callback);
  }
  
  unsubscribe(event: string, callback: (...args: any[]) => void) {
    const subscribers = this.subscriptions.get(event);
    if (subscribers) {
      subscribers.delete(callback);
    }
  }
  
  private emit(event: string, ...args: any[]) {
    const subscribers = this.subscriptions.get(event);
    if (subscribers) {
      subscribers.forEach(callback => callback(...args));
    }
  }
  
  disconnect() {
    this.transport.disconnect();
  }
  
  get isConnected(): boolean {
    return this.transport.isConnected;
  }
}

// Global instances
export const apiClient = new APIClient();
export const agentAPI = new AgentAPI();
export const agentWebSocket = new AgentWebSocketService();

// Export types
export type { RequestOptions, CachedResponse };