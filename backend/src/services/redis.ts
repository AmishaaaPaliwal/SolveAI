// Redis caching service

import { createClient, RedisClientType } from 'redis';

class RedisService {
  private client: RedisClientType;
  private _isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this._isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
      this._isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('❌ Redis disconnected');
      this._isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      console.error('Redis connection failed, continuing without Redis:', error);
      // Don't throw, continue without Redis
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  // Generic cache operations
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
      throw error;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis DELETE error:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      throw error;
    }
  }

  // Cache with TTL (Time To Live)
  async setWithTTL(key: string, value: any, ttlSeconds: number): Promise<void> {
    await this.set(key, value, ttlSeconds);
  }

  // Cache patient data
  async cachePatientData(patientId: string, data: any): Promise<void> {
    const key = `patient:${patientId}`;
    await this.setWithTTL(key, data, 3600); // 1 hour TTL
  }

  async getCachedPatientData(patientId: string): Promise<any | null> {
    const key = `patient:${patientId}`;
    return await this.get(key);
  }

  // Cache diet plans
  async cacheDietPlan(planId: string, data: any): Promise<void> {
    const key = `diet_plan:${planId}`;
    await this.setWithTTL(key, data, 1800); // 30 minutes TTL
  }

  async getCachedDietPlan(planId: string): Promise<any | null> {
    const key = `diet_plan:${planId}`;
    return await this.get(key);
  }

  // Cache AI responses
  async cacheAIResponse(query: string, response: any): Promise<void> {
    const key = `ai_response:${Buffer.from(query).toString('base64').slice(0, 50)}`;
    await this.setWithTTL(key, response, 7200); // 2 hours TTL
  }

  async getCachedAIResponse(query: string): Promise<any | null> {
    const key = `ai_response:${Buffer.from(query).toString('base64').slice(0, 50)}`;
    return await this.get(key);
  }

  // Cache nutritional data
  async cacheNutritionalData(foodId: string, data: any): Promise<void> {
    const key = `nutrition:${foodId}`;
    await this.setWithTTL(key, data, 86400); // 24 hours TTL
  }

  async getCachedNutritionalData(foodId: string): Promise<any | null> {
    const key = `nutrition:${foodId}`;
    return await this.get(key);
  }

  // Session management
  async setSession(sessionId: string, data: any): Promise<void> {
    const key = `session:${sessionId}`;
    await this.setWithTTL(key, data, 86400); // 24 hours TTL
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.delete(key);
  }

  // Rate limiting
  async incrementRateLimit(identifier: string, windowSeconds: number = 60): Promise<number> {
    if (!this.isConnected) return 1; // Allow if Redis not available
    const key = `rate_limit:${identifier}`;
    const count = await this.client.incr(key);

    if (count === 1) {
      await this.client.expire(key, windowSeconds);
    }

    return count;
  }

  async getRateLimit(identifier: string): Promise<number> {
    if (!this.isConnected) return 0;
    const key = `rate_limit:${identifier}`;
    const count = await this.client.get(key);
    return count ? parseInt(count) : 0;
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this._isConnected;
  }
}

// Export singleton instance
export const redisService = new RedisService();
export default redisService;