"use strict";
// Diet Plans API routes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Placeholder routes - to be implemented with full service
router.get('/', async (req, res) => {
    res.json({ message: 'Diet plans endpoint - coming soon' });
});
router.post('/', async (req, res) => {
    res.json({ message: 'Create diet plan - coming soon' });
});
exports.default = router;
//# sourceMappingURL=dietPlans.js.map