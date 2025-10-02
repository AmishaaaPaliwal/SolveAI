"use strict";
// Firebase Admin SDK for backend operations
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
// Initialize Firebase Admin
if (!admin.apps.length) {
    // For development, use default credentials if available
    // For production, use service account key from environment
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            // Parse the service account JSON
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            console.log('✅ Firebase Admin initialized with service account');
        }
        catch (error) {
            console.error('❌ Failed to parse Firebase service account JSON:', error);
            console.error('Please check your FIREBASE_SERVICE_ACCOUNT_KEY in .env file');
            throw error;
        }
    }
    else {
        // Use default credentials (for development with Firebase CLI)
        console.log('⚠️ No service account key found, using default credentials');
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID
        });
    }
}
exports.db = (0, firestore_1.getFirestore)();
exports.auth = admin.auth();
exports.default = admin;
//# sourceMappingURL=firebase.js.map