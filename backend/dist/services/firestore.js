"use strict";
// Backend Firestore service using Firebase Admin SDK
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientsService = exports.FirestoreService = void 0;
const firebase_1 = require("./firebase");
// Generic CRUD functions
class FirestoreService {
    // Create document
    static async create(collectionName, data) {
        try {
            const collectionRef = firebase_1.db.collection(collectionName);
            const docRef = await collectionRef.add({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            return { ...data, id: docRef.id };
        }
        catch (error) {
            console.error(`Error creating document in ${collectionName}:`, error);
            throw error;
        }
    }
    // Read single document
    static async getById(collectionName, id) {
        try {
            const docRef = firebase_1.db.collection(collectionName).doc(id);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        }
        catch (error) {
            console.error(`Error getting document ${id} from ${collectionName}:`, error);
            throw error;
        }
    }
    // Read multiple documents with optional filters
    static async getAll(collectionName, queryBuilder) {
        try {
            let query = firebase_1.db.collection(collectionName);
            if (queryBuilder) {
                query = queryBuilder(query);
            }
            const querySnapshot = await query.get();
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            console.error(`Error getting documents from ${collectionName}:`, error);
            throw error;
        }
    }
    // Update document
    static async update(collectionName, id, data) {
        try {
            const docRef = firebase_1.db.collection(collectionName).doc(id);
            await docRef.update({
                ...data,
                updatedAt: new Date(),
            });
        }
        catch (error) {
            console.error(`Error updating document ${id} in ${collectionName}:`, error);
            throw error;
        }
    }
    // Delete document
    static async delete(collectionName, id) {
        try {
            const docRef = firebase_1.db.collection(collectionName).doc(id);
            await docRef.delete();
        }
        catch (error) {
            console.error(`Error deleting document ${id} from ${collectionName}:`, error);
            throw error;
        }
    }
}
exports.FirestoreService = FirestoreService;
// Specific service functions for common operations
exports.patientsService = {
    // Get all patients
    getAll: () => FirestoreService.getAll('patients'),
    // Get patient by ID
    getById: (id) => FirestoreService.getById('patients', id),
    // Get patients by dietitian
    getByDietitian: (dietitianId) => FirestoreService.getAll('patients', (query) => query.where('dietitianId', '==', dietitianId)),
    // Create patient
    create: (data) => FirestoreService.create('patients', data),
    // Update patient
    update: (id, data) => FirestoreService.update('patients', id, data),
    // Delete patient
    delete: (id) => FirestoreService.delete('patients', id),
};
//# sourceMappingURL=firestore.js.map