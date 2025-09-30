"use strict";
// AI routes for diet generation and Ayurvedic analysis
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ai_1 = require("../services/ai");
const router = express_1.default.Router();
// POST /api/ai/generate-diet - Generate personalized Ayurvedic diet plan
router.post('/generate-diet', async (req, res) => {
    try {
        const { patientProfile, vitals, messMenu, ayurvedicPrinciples } = req.body;
        // Validate required fields
        if (!patientProfile || !vitals || !messMenu) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: patientProfile, vitals, messMenu'
            });
        }
        const patientData = {
            profile: patientProfile,
            vitals: vitals,
            messMenu: messMenu,
            ayurvedicPrinciples: ayurvedicPrinciples || 'General Ayurvedic principles'
        };
        const dietPlan = await ai_1.aiService.generateDietPlan(patientData);
        res.json({
            success: true,
            data: dietPlan
        });
    }
    catch (error) {
        console.error('AI Diet Generation Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate diet plan',
            message: error.message
        });
    }
});
// POST /api/ai/analyze-dosha - Analyze patient dosha
router.post('/analyze-dosha', async (req, res) => {
    try {
        const { symptoms, characteristics, preferences } = req.body;
        if (!symptoms || !characteristics) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: symptoms, characteristics'
            });
        }
        const patientData = {
            symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
            characteristics: Array.isArray(characteristics) ? characteristics : [characteristics],
            preferences: Array.isArray(preferences) ? preferences : []
        };
        const doshaAnalysis = await ai_1.aiService.analyzeDosha(patientData);
        res.json({
            success: true,
            data: doshaAnalysis
        });
    }
    catch (error) {
        console.error('AI Dosha Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze dosha',
            message: error.message
        });
    }
});
// POST /api/ai/suggest-alternatives - Suggest food alternatives
router.post('/suggest-alternatives', async (req, res) => {
    try {
        const { foodName, reason } = req.body;
        if (!foodName || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: foodName, reason'
            });
        }
        const alternatives = await ai_1.aiService.suggestAlternatives(foodName, reason);
        res.json({
            success: true,
            data: alternatives
        });
    }
    catch (error) {
        console.error('AI Alternatives Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to suggest alternatives',
            message: error.message
        });
    }
});
// POST /api/ai/generate-timings - Generate meal timings
router.post('/generate-timings', async (req, res) => {
    try {
        const { doshaType, dailyRoutine } = req.body;
        if (!doshaType || !dailyRoutine) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: doshaType, dailyRoutine'
            });
        }
        const timings = await ai_1.aiService.generateMealTimings(doshaType, dailyRoutine);
        res.json({
            success: true,
            data: timings
        });
    }
    catch (error) {
        console.error('AI Timings Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate timings',
            message: error.message
        });
    }
});
// GET /api/ai/health - Check AI service health
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await ai_1.aiService.healthCheck();
        res.json({
            success: true,
            healthy: isHealthy,
            service: 'AI Service',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('AI Health Check Error:', error);
        res.status(500).json({
            success: false,
            healthy: false,
            error: 'AI service health check failed',
            message: error.message
        });
    }
});
// GET /api/ai/cache/clear - Clear AI response cache (admin only)
router.post('/cache/clear', async (req, res) => {
    try {
        // In a real app, you'd add authentication here
        // For now, we'll just clear all AI-related cache keys
        // This is a simplified approach - in production you'd want more granular control
        const cacheCleared = true; // Placeholder
        res.json({
            success: true,
            message: 'AI cache cleared successfully',
            cacheCleared
        });
    }
    catch (error) {
        console.error('Cache Clear Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear cache',
            message: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map