"use strict";
// Diet Plans API routes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dietPlans_1 = require("../services/dietPlans");
const redis_1 = require("../services/redis");
const router = express_1.default.Router();
// GET /api/dietPlans - Get all diet plans
router.get('/', async (req, res) => {
    try {
        // Check cache first
        const cacheKey = 'dietPlans:all';
        let dietPlans = await redis_1.redisService.getCachedPatientData(cacheKey);
        if (!dietPlans) {
            // Fetch from Firestore
            dietPlans = await dietPlans_1.dietPlansService.getAll();
            // Cache for 30 minutes
            await redis_1.redisService.cachePatientData(cacheKey, dietPlans);
        }
        res.json({
            success: true,
            data: dietPlans,
            cached: dietPlans !== null
        });
    }
    catch (error) {
        console.error('Error fetching diet plans:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch diet plans',
            message: error.message
        });
    }
});
// GET /api/dietPlans/:id - Get diet plan by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Check cache first
        let dietPlan = await redis_1.redisService.getCachedPatientData(id);
        if (!dietPlan) {
            // Fetch from Firestore
            dietPlan = await dietPlans_1.dietPlansService.getById(id);
            if (dietPlan) {
                // Cache for 1 hour
                await redis_1.redisService.cachePatientData(id, dietPlan);
            }
        }
        if (!dietPlan) {
            return res.status(404).json({
                success: false,
                error: 'Diet plan not found'
            });
        }
        res.json({
            success: true,
            data: dietPlan,
            cached: dietPlan !== null
        });
    }
    catch (error) {
        console.error('Error fetching diet plan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch diet plan',
            message: error.message
        });
    }
});
// GET /api/dietPlans/patient/:patientId - Get diet plans by patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        // Check cache first
        const cacheKey = `dietPlans:patient:${patientId}`;
        let dietPlans = await redis_1.redisService.getCachedPatientData(cacheKey);
        if (!dietPlans) {
            // Fetch from Firestore
            dietPlans = await dietPlans_1.dietPlansService.getByPatient(patientId);
            // Cache for 30 minutes
            await redis_1.redisService.cachePatientData(cacheKey, dietPlans);
        }
        res.json({
            success: true,
            data: dietPlans,
            cached: dietPlans !== null
        });
    }
    catch (error) {
        console.error('Error fetching diet plans by patient:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch diet plans',
            message: error.message
        });
    }
});
// GET /api/dietPlans/dietitian/:dietitianId - Get diet plans by dietitian
router.get('/dietitian/:dietitianId', async (req, res) => {
    try {
        const { dietitianId } = req.params;
        // Check cache first
        const cacheKey = `dietPlans:dietitian:${dietitianId}`;
        let dietPlans = await redis_1.redisService.getCachedPatientData(cacheKey);
        if (!dietPlans) {
            // Fetch from Firestore
            dietPlans = await dietPlans_1.dietPlansService.getByDietitian(dietitianId);
            // Cache for 30 minutes
            await redis_1.redisService.cachePatientData(cacheKey, dietPlans);
        }
        res.json({
            success: true,
            data: dietPlans,
            cached: dietPlans !== null
        });
    }
    catch (error) {
        console.error('Error fetching diet plans by dietitian:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch diet plans',
            message: error.message
        });
    }
});
// POST /api/dietPlans - Create new diet plan
router.post('/', async (req, res) => {
    try {
        const planData = req.body;
        // Validate required fields
        if (!planData.patientId || !planData.dietitianId || !planData.title ||
            !planData.description || !planData.dietDays) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: patientId, dietitianId, title, description, dietDays'
            });
        }
        // Set defaults
        if (planData.isActive === undefined)
            planData.isActive = true;
        if (!planData.createdAt)
            planData.createdAt = new Date();
        if (!planData.updatedAt)
            planData.updatedAt = new Date();
        const newPlan = await dietPlans_1.dietPlansService.create(planData);
        // Invalidate cache
        await redis_1.redisService.delete('dietPlans:all');
        res.status(201).json({
            success: true,
            data: newPlan,
            message: 'Diet plan created successfully'
        });
    }
    catch (error) {
        console.error('Error creating diet plan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create diet plan',
            message: error.message
        });
    }
});
// PUT /api/dietPlans/:id - Update diet plan
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Update timestamp
        updateData.updatedAt = new Date();
        await dietPlans_1.dietPlansService.update(id, updateData);
        // Invalidate cache
        await redis_1.redisService.delete(`dietPlans:${id}`);
        await redis_1.redisService.delete('dietPlans:all');
        res.json({
            success: true,
            message: 'Diet plan updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating diet plan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update diet plan',
            message: error.message
        });
    }
});
// DELETE /api/dietPlans/:id - Delete diet plan
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await dietPlans_1.dietPlansService.delete(id);
        // Invalidate cache
        await redis_1.redisService.delete(`dietPlans:${id}`);
        await redis_1.redisService.delete('dietPlans:all');
        res.json({
            success: true,
            message: 'Diet plan deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting diet plan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete diet plan',
            message: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=dietPlans.js.map