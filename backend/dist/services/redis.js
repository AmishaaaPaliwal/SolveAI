"use strict";
// Redis caching service
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const redis_1 = require("redis");
class RedisService {
    constructor() {
        this._isConnected = false;
        this.client = (0, redis_1.createClient)({
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
    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.client.disconnect();
        }
    }
    // Generic cache operations
    async set(key, value, ttlSeconds) {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, serializedValue);
            }
            else {
                await this.client.set(key, serializedValue);
            }
        }
        catch (error) {
            console.error('Redis SET error:', error);
            throw error;
        }
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error('Redis GET error:', error);
            throw error;
        }
    }
    async delete(key) {
        try {
            const result = await this.client.del(key);
            return result > 0;
        }
        catch (error) {
            console.error('Redis DELETE error:', error);
            throw error;
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result > 0;
        }
        catch (error) {
            console.error('Redis EXISTS error:', error);
            throw error;
        }
    }
    // Cache with TTL (Time To Live)
    async setWithTTL(key, value, ttlSeconds) {
        await this.set(key, value, ttlSeconds);
    }
    // Cache patient data
    async cachePatientData(patientId, data) {
        const key = `patient:${patientId}`;
        await this.setWithTTL(key, data, 3600); // 1 hour TTL
    }
    async getCachedPatientData(patientId) {
        const key = `patient:${patientId}`;
        return await this.get(key);
    }
    // Cache diet plans
    async cacheDietPlan(planId, data) {
        const key = `diet_plan:${planId}`;
        await this.setWithTTL(key, data, 1800); // 30 minutes TTL
    }
    async getCachedDietPlan(planId) {
        const key = `diet_plan:${planId}`;
        return await this.get(key);
    }
    // Cache AI responses
    async cacheAIResponse(query, response) {
        const key = `ai_response:${Buffer.from(query).toString('base64').slice(0, 50)}`;
        await this.setWithTTL(key, response, 7200); // 2 hours TTL
    }
    async getCachedAIResponse(query) {
        const key = `ai_response:${Buffer.from(query).toString('base64').slice(0, 50)}`;
        return await this.get(key);
    }
    // Cache nutritional data
    async cacheNutritionalData(foodId, data) {
        const key = `nutrition:${foodId}`;
        await this.setWithTTL(key, data, 86400); // 24 hours TTL
    }
    async getCachedNutritionalData(foodId) {
        const key = `nutrition:${foodId}`;
        return await this.get(key);
    }
    // Session management
    async setSession(sessionId, data) {
        const key = `session:${sessionId}`;
        await this.setWithTTL(key, data, 86400); // 24 hours TTL
    }
    async getSession(sessionId) {
        const key = `session:${sessionId}`;
        return await this.get(key);
    }
    async deleteSession(sessionId) {
        const key = `session:${sessionId}`;
        await this.delete(key);
    }
    // Rate limiting
    async incrementRateLimit(identifier, windowSeconds = 60) {
        const key = `rate_limit:${identifier}`;
        const count = await this.client.incr(key);
        if (count === 1) {
            await this.client.expire(key, windowSeconds);
        }
        return count;
    }
    async getRateLimit(identifier) {
        const key = `rate_limit:${identifier}`;
        const count = await this.client.get(key);
        return count ? parseInt(count) : 0;
    }
    // Health check
    async ping() {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        }
        catch (error) {
            return false;
        }
    }
    // Get connection status
    get isConnected() {
        return this._isConnected;
    }
}
// Export singleton instance
exports.redisService = new RedisService();
exports.default = exports.redisService;
//# sourceMappingURL=redis.js.map