// Backend Firestore service using Firebase Admin SDK

import { db } from './firebase';

// Generic CRUD functions
export class FirestoreService {
  // Create document
  static async create<T extends { id?: string }>(
    collectionName: string,
    data: Omit<T, 'id'>
  ): Promise<T> {
    try {
      const collectionRef = db.collection(collectionName);
      const docRef = await collectionRef.add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ...data, id: docRef.id } as T;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Read single document
  static async getById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = db.collection(collectionName).doc(id);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  // Read multiple documents with optional filters
  static async getAll<T>(
    collectionName: string,
    queryBuilder?: (query: any) => any
  ): Promise<T[]> {
    try {
      let query = db.collection(collectionName);

      if (queryBuilder) {
        query = queryBuilder(query);
      }

      const querySnapshot = await query.get();
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // Update document
  static async update<T extends { id: string }>(
    collectionName: string,
    id: string,
    data: Partial<Omit<T, 'id'>>
  ): Promise<void> {
    try {
      const docRef = db.collection(collectionName).doc(id);
      await docRef.update({
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  }

  // Delete document
  static async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = db.collection(collectionName).doc(id);
      await docRef.delete();
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }
}

// Specific service functions for common operations
export const patientsService = {
  // Get all patients
  getAll: () => FirestoreService.getAll<Patient>('patients'),

  // Get patient by ID
  getById: (id: string) => FirestoreService.getById<Patient>('patients', id),

  // Get patients by dietitian
  getByDietitian: (dietitianId: string) =>
    FirestoreService.getAll<Patient>('patients', (query) =>
      query.where('dietitianId', '==', dietitianId)
    ),

  // Create patient
  create: (data: Omit<Patient, 'id'>) => FirestoreService.create<Patient>('patients', data),

  // Update patient
  update: (id: string, data: Partial<Omit<Patient, 'id'>>) =>
    FirestoreService.update<Patient>('patients', id, data),

  // Delete patient
  delete: (id: string) => FirestoreService.delete('patients', id),
};

// Type definitions (simplified for backend)
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  code: string;
  dietitianId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}