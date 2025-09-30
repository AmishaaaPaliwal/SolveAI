"use strict";
// Mess Menus API routes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Placeholder routes - to be implemented with full service
router.get('/', async (req, res) => {
    res.json({ message: 'Mess menus endpoint - coming soon' });
});
router.post('/', async (req, res) => {
    res.json({ message: 'Create mess menu - coming soon' });
});
exports.default = router;
//# sourceMappingURL=messMenus.js.map