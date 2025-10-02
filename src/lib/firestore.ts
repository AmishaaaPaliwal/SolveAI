// Firestore service functions for CRUD operations

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// Generic CRUD functions
export class FirestoreService {
  // Create document
  static async create<T extends { id?: string }>(
    collectionName: string,
    data: Omit<T, 'id'>
  ): Promise<T> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
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
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
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
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
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
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  }

  // Delete document
  static async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listener
  static subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = [],
    onError?: (error: Error) => void
  ): () => void {
    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        callback(data);
      },
      (error) => {
        console.error(`Error in real-time listener for ${collectionName}:`, error);
        onError?.(error);
      }
    );
    return unsubscribe;
  }

  // Real-time listener for single document
  static subscribeToDocument<T>(
    collectionName: string,
    id: string,
    callback: (data: T | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, collectionName, id);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          callback({ id: docSnapshot.id, ...docSnapshot.data() } as T);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`Error in real-time listener for document ${id} in ${collectionName}:`, error);
        onError?.(error);
      }
    );
    return unsubscribe;
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
    FirestoreService.getAll<Patient>('patients', [where('dietitianId', '==', dietitianId)]),

  // Create patient
  create: (data: Omit<Patient, 'id'>) => FirestoreService.create<Patient>('patients', data),

  // Update patient
  update: (id: string, data: Partial<Omit<Patient, 'id'>>) =>
    FirestoreService.update<Patient>('patients', id, data),

  // Delete patient
  delete: (id: string) => FirestoreService.delete('patients', id),

  // Subscribe to patients (real-time)
  subscribe: (callback: (patients: Patient[]) => void, dietitianId?: string) => {
    const constraints = dietitianId ? [where('dietitianId', '==', dietitianId)] : [];
    return FirestoreService.subscribeToCollection<Patient>('patients', callback, constraints);
  },
};

export const dietPlansService = {
  // Get all diet plans
  getAll: () => FirestoreService.getAll<DietPlan>('dietPlans', [orderBy('createdAt', 'desc')]),

  // Get all diet plans for a patient
  getByPatient: async (patientId: string) => {
    try {
      return await FirestoreService.getAll<DietPlan>('dietPlans', [
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      ]);
    } catch (error: any) {
      // If index is building, try a simpler query as fallback
      if (error.message && error.message.includes('requires an index')) {
        console.warn('Diet plans index is building, using fallback query');

        // Fallback: Get all diet plans for the patient without ordering
        const allPlans = await FirestoreService.getAll<DietPlan>('dietPlans', [
          where('patientId', '==', patientId)
        ]);

        // Sort client-side (less efficient but works)
        return allPlans.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date((a.createdAt as any)?.seconds * 1000 || 0);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date((b.createdAt as any)?.seconds * 1000 || 0);
          return dateB.getTime() - dateA.getTime(); // Descending order
        });
      }
      throw error;
    }
  },

  // Create diet plan
  create: (data: Omit<DietPlan, 'id'>) => FirestoreService.create<DietPlan>('dietPlans', data),

  // Update diet plan
  update: (id: string, data: Partial<Omit<DietPlan, 'id'>>) =>
    FirestoreService.update<DietPlan>('dietPlans', id, data),

  // Delete diet plan
  delete: (id: string) => FirestoreService.delete('dietPlans', id),
};

export const consultationsService = {
  // Get all consultations
  getAll: () => FirestoreService.getAll<Consultation>('consultations', [orderBy('date', 'desc')]),

  // Get consultations for a patient
  getByPatient: (patientId: string) =>
    FirestoreService.getAll<Consultation>('consultations', [
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    ]),

  // Get consultations for a dietitian
  getByDietitian: (dietitianId: string) =>
    FirestoreService.getAll<Consultation>('consultations', [
      where('dietitianId', '==', dietitianId),
      orderBy('date', 'desc')
    ]),

  // Create consultation
  create: (data: Omit<Consultation, 'id'>) => FirestoreService.create<Consultation>('consultations', data),

  // Update consultation
  update: (id: string, data: Partial<Omit<Consultation, 'id'>>) =>
    FirestoreService.update<Consultation>('consultations', id, data),
};

export const messMenusService = {
  // Get all mess menus for a hospital
  getByHospital: (hospitalId: string) =>
    FirestoreService.getAll<MessMenu>('messMenus', [
      where('hospitalId', '==', hospitalId),
      orderBy('date', 'desc')
    ]),

  // Get today's mess menu for a hospital
  getTodayMenu: async (hospitalId: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return await FirestoreService.getAll<MessMenu>('messMenus', [
        where('hospitalId', '==', hospitalId),
        where('date', '>=', today),
        where('date', '<', tomorrow),
        where('isActive', '==', true)
      ]);
    } catch (error: any) {
      // If index is building, try a simpler query as fallback
      if (error.message && error.message.includes('requires an index')) {
        console.warn('Index is building, using fallback query for today\'s menu');

        // Fallback: Get all active menus for the hospital and filter client-side
        const allMenus = await FirestoreService.getAll<MessMenu>('messMenus', [
          where('hospitalId', '==', hospitalId),
          where('isActive', '==', true)
        ]);

        // Filter for today's date on the client side
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return allMenus.filter(menu => {
          let menuDate: Date;
          if (menu.date instanceof Date) {
            menuDate = menu.date;
          } else if (menu.date && typeof menu.date === 'object' && 'seconds' in menu.date) {
            // Firestore Timestamp
            menuDate = new Date((menu.date as any).seconds * 1000);
          } else {
            return false; // Invalid date
          }
          return menuDate >= today && menuDate < tomorrow;
        });
      }
      throw error;
    }
  },

  // Create mess menu
  create: (data: Omit<MessMenu, 'id'>) => FirestoreService.create<MessMenu>('messMenus', data),

  // Update mess menu
  update: (id: string, data: Partial<Omit<MessMenu, 'id'>>) =>
    FirestoreService.update<MessMenu>('messMenus', id, data),

  // Delete mess menu
  delete: (id: string) => FirestoreService.delete('messMenus', id),

  // Deactivate old menus and activate new one
  async setActiveMenu(hospitalId: string, menuId: string): Promise<void> {
    try {
      // First, deactivate all active menus for this hospital
      const activeMenus = await FirestoreService.getAll<MessMenu>('messMenus', [
        where('hospitalId', '==', hospitalId),
        where('isActive', '==', true)
      ]);

      // Deactivate all active menus
      const deactivatePromises = activeMenus.map(menu =>
        FirestoreService.update<MessMenu>('messMenus', menu.id, { isActive: false })
      );
      await Promise.all(deactivatePromises);

      // Activate the new menu
      await FirestoreService.update<MessMenu>('messMenus', menuId, { isActive: true });
    } catch (error) {
      console.error('Error setting active menu:', error);
      throw error;
    }
  },
};

export const vitalsService = {
  // Get all vitals for a patient
  getByPatient: async (patientId: string) => {
    try {
      return await FirestoreService.getAll<Vitals>('vitals', [
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      ]);
    } catch (error: any) {
      // If index is building, try a simpler query as fallback
      if (error.message && error.message.includes('requires an index')) {
        console.warn('Vitals index is building, using fallback query');

        // Fallback: Get all vitals for the patient without ordering
        const allVitals = await FirestoreService.getAll<Vitals>('vitals', [
          where('patientId', '==', patientId)
        ]);

        // Sort client-side (less efficient but works)
        return allVitals.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date((a.date as any)?.seconds * 1000 || 0);
          const dateB = b.date instanceof Date ? b.date : new Date((b.date as any)?.seconds * 1000 || 0);
          return dateB.getTime() - dateA.getTime(); // Descending order
        });
      }
      throw error;
    }
  },

  // Get latest vitals for a patient
  getLatest: (patientId: string) =>
    FirestoreService.getAll<Vitals>('vitals', [
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
      limit(1)
    ]),

  // Create vitals record
  create: (data: Omit<Vitals, 'id'>) => FirestoreService.create<Vitals>('vitals', data),

  // Update vitals record
  update: (id: string, data: Partial<Omit<Vitals, 'id'>>) =>
    FirestoreService.update<Vitals>('vitals', id, data),

  // Delete vitals record
  delete: (id: string) => FirestoreService.delete('vitals', id),
};

export const mealTrackingService = {
  // Get all meal tracking records for a patient
  getByPatient: (patientId: string) =>
    FirestoreService.getAll<MealTracking>('mealTracking', [
      where('patientId', '==', patientId),
      orderBy('scheduledDate', 'desc')
    ]),

  // Get meal tracking for a specific date range
  getByDateRange: (patientId: string, startDate: Date, endDate: Date) =>
    FirestoreService.getAll<MealTracking>('mealTracking', [
      where('patientId', '==', patientId),
      where('scheduledDate', '>=', startDate),
      where('scheduledDate', '<=', endDate),
      orderBy('scheduledDate', 'desc')
    ]),

  // Get today's meal tracking for a patient
  getTodayMeals: (patientId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return FirestoreService.getAll<MealTracking>('mealTracking', [
      where('patientId', '==', patientId),
      where('scheduledDate', '>=', today),
      where('scheduledDate', '<', tomorrow)
    ]);
  },

  // Create meal tracking record
  create: (data: Omit<MealTracking, 'id'>) => FirestoreService.create<MealTracking>('mealTracking', data),

  // Update meal tracking record
  update: (id: string, data: Partial<Omit<MealTracking, 'id'>>) =>
    FirestoreService.update<MealTracking>('mealTracking', id, data),

  // Mark meal as given
  markAsGiven: (id: string, givenBy: string, notes?: string) =>
    FirestoreService.update<MealTracking>('mealTracking', id, {
      givenBy,
      givenAt: new Date(),
      status: 'given',
      ...(notes && { notes })
    }),

  // Mark meal as eaten
  markAsEaten: (id: string, eatenBy: 'patient' | 'family', quantity?: 'full' | 'half' | 'quarter' | 'none', notes?: string) =>
    FirestoreService.update<MealTracking>('mealTracking', id, {
      eatenBy,
      eatenAt: new Date(),
      quantity,
      status: quantity === 'none' ? 'skipped' : 'eaten',
      ...(notes && { notes })
    }),

  // Delete meal tracking record
  delete: (id: string) => FirestoreService.delete('mealTracking', id),

  // Subscribe to meal tracking updates for a patient
  subscribe: (patientId: string, callback: (meals: MealTracking[]) => void) =>
    FirestoreService.subscribeToCollection<MealTracking>(
      'mealTracking',
      callback,
      [where('patientId', '==', patientId), orderBy('scheduledDate', 'desc')]
    ),
};

export const patientFeedbackService = {
  // Get all feedback for a patient
  getByPatient: (patientId: string) =>
    FirestoreService.getAll<PatientFeedback>('patientFeedback', [
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    ]),

  // Get feedback for a date range
  getByDateRange: (patientId: string, startDate: Date, endDate: Date) =>
    FirestoreService.getAll<PatientFeedback>('patientFeedback', [
      where('patientId', '==', patientId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    ]),

  // Get today's feedback for a patient
  getTodayFeedback: (patientId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return FirestoreService.getAll<PatientFeedback>('patientFeedback', [
      where('patientId', '==', patientId),
      where('date', '>=', today),
      where('date', '<', tomorrow)
    ]);
  },

  // Create patient feedback
  create: (data: Omit<PatientFeedback, 'id'>) => FirestoreService.create<PatientFeedback>('patientFeedback', data),

  // Update patient feedback
  update: (id: string, data: Partial<Omit<PatientFeedback, 'id'>>) =>
    FirestoreService.update<PatientFeedback>('patientFeedback', id, data),

  // Delete patient feedback
  delete: (id: string) => FirestoreService.delete('patientFeedback', id),

  // Subscribe to feedback updates for a patient
  subscribe: (patientId: string, callback: (feedback: PatientFeedback[]) => void) =>
    FirestoreService.subscribeToCollection<PatientFeedback>(
      'patientFeedback',
      callback,
      [where('patientId', '==', patientId), orderBy('date', 'desc')]
    ),
};

export const usersService = {
  // Get all users
  getAll: () => FirestoreService.getAll<User>('users'),

  // Get user by ID (uid)
  getById: (uid: string) => FirestoreService.getById<User>('users', uid),

  // Get users by role
  getByRole: (role: User['role']) =>
    FirestoreService.getAll<User>('users', [where('role', '==', role)]),

  // Get users by hospital
  getByHospital: (hospitalId: string) =>
    FirestoreService.getAll<User>('users', [where('hospitalId', '==', hospitalId)]),

  // Create user (uid as document ID)
  create: async (data: User) => {
    const docRef = doc(db, 'users', data.uid);
    await setDoc(docRef, {
      ...data,
      createdAt: Timestamp.fromDate(data.createdAt),
      lastLogin: Timestamp.fromDate(data.lastLogin),
    });
    return data;
  },

  // Update user
  update: async (uid: string, data: Partial<Omit<User, 'uid'>>) => {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, data);
  },

  // Delete user
  delete: (uid: string) => FirestoreService.delete('users', uid),

  // Subscribe to users
  subscribe: (callback: (users: User[]) => void, constraints?: QueryConstraint[]) =>
    FirestoreService.subscribeToCollection<User>('users', callback, constraints || []),
};

export const hospitalsService = {
  // Get all hospitals
  getAll: () => FirestoreService.getAll<Hospital>('hospitals'),

  // Get hospital by ID
  getById: (id: string) => FirestoreService.getById<Hospital>('hospitals', id),

  // Get hospitals by admin
  getByAdmin: (adminId: string) =>
    FirestoreService.getAll<Hospital>('hospitals', [where('adminId', '==', adminId)]),

  // Create hospital
  create: async (data: Omit<Hospital, 'id'>) => {
    const docRef = await addDoc(collection(db, 'hospitals'), {
      ...data,
      createdAt: Timestamp.fromDate(data.createdAt),
    });
    return { ...data, id: docRef.id } as Hospital;
  },

  // Update hospital
  update: (id: string, data: Partial<Omit<Hospital, 'id'>>) =>
    FirestoreService.update<Hospital>('hospitals', id, data),

  // Delete hospital
  delete: (id: string) => FirestoreService.delete('hospitals', id),

  // Subscribe to hospitals
  subscribe: (callback: (hospitals: Hospital[]) => void, constraints?: QueryConstraint[]) =>
    FirestoreService.subscribeToCollection<Hospital>('hospitals', callback, constraints || []),
};

// Food database service for Ayurvedic food items
export const foodDatabaseService = {
  // Get all food items
  getAll: () => FirestoreService.getAll<FoodItem>('foodDatabase', [orderBy('name', 'asc')]),

  // Get food items by category
  getByCategory: (category: FoodItem['category']) =>
    FirestoreService.getAll<FoodItem>('foodDatabase', [
      where('category', '==', category),
      orderBy('name', 'asc')
    ]),

  // Search food items by name
  searchByName: (searchTerm: string) =>
    FirestoreService.getAll<FoodItem>('foodDatabase', [
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      orderBy('name', 'asc')
    ]),

  // Get food items suitable for a dosha
  getByDoshaSuitability: (dosha: 'Vata' | 'Pitta' | 'Kapha') =>
    FirestoreService.getAll<FoodItem>('foodDatabase', [
      where(`doshaSuitability.${dosha}`, '==', true),
      orderBy('name', 'asc')
    ]),

  // Get alternatives for a food item
  getAlternatives: async (foodId: string) => {
    const foodItem = await FirestoreService.getById<FoodItem>('foodDatabase', foodId);
    if (!foodItem || !foodItem.commonAlternatives) return [];

    // Get alternative food items
    const alternatives = await Promise.all(
      foodItem.commonAlternatives.map(altId =>
        FirestoreService.getById<FoodItem>('foodDatabase', altId)
      )
    );

    return alternatives.filter(alt => alt !== null) as FoodItem[];
  },

  // Create food item
  create: (data: Omit<FoodItem, 'id'>) => FirestoreService.create<FoodItem>('foodDatabase', data),

  // Update food item
  update: (id: string, data: Partial<Omit<FoodItem, 'id'>>) =>
    FirestoreService.update<FoodItem>('foodDatabase', id, data),

  // Delete food item
  delete: (id: string) => FirestoreService.delete('foodDatabase', id),
};

// Sample data seeding functions for development
export const seedData = {
  async seedHospitals(): Promise<Hospital[]> {
    const sampleHospitals = [
      {
        name: 'City General Hospital',
        address: '123 Main Street, City, State 12345',
        phone: '+1-555-0123',
        email: 'admin@citygeneral.com',
        adminId: 'hospital-admin-uid-1',
        createdAt: new Date(),
      },
      {
        name: 'Regional Medical Center',
        address: '456 Health Ave, Town, State 67890',
        phone: '+1-555-0456',
        email: 'admin@regionalmed.com',
        adminId: 'hospital-admin-uid-2',
        createdAt: new Date(),
      },
    ];

    const createdHospitals: Hospital[] = [];
    for (const hospital of sampleHospitals) {
      try {
        const created = await hospitalsService.create(hospital);
        createdHospitals.push(created);
        console.log(`Seeded hospital: ${hospital.name}`);
      } catch (error) {
        console.error(`Error seeding hospital ${hospital.name}:`, error);
      }
    }
    return createdHospitals;
  },

  async seedUsers(hospitals: Hospital[]) {
    const hospitalMap = hospitals.reduce((map, h) => {
      map[h.name] = h.id;
      return map;
    }, {} as Record<string, string>);

    const sampleUsers = [
      {
        uid: 'hospital-admin-uid-1',
        email: 'admin@citygeneral.com',
        displayName: 'Dr. Sarah Johnson',
        role: 'hospital-admin' as const,
        hospitalId: hospitalMap['City General Hospital'],
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      {
        uid: 'dietitian-uid-1',
        email: 'dietitian@citygeneral.com',
        displayName: 'Dr. Michael Chen',
        role: 'dietitian' as const,
        hospitalId: hospitalMap['City General Hospital'],
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      {
        uid: 'patient-uid-1',
        email: 'patient1@citygeneral.com',
        displayName: 'Alice Smith',
        role: 'patient' as const,
        hospitalId: hospitalMap['City General Hospital'],
        patientId: 'patient-id-1',
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      {
        uid: 'hospital-admin-uid-2',
        email: 'admin@regionalmed.com',
        displayName: 'Dr. Robert Davis',
        role: 'hospital-admin' as const,
        hospitalId: hospitalMap['Regional Medical Center'],
        createdAt: new Date(),
        lastLogin: new Date(),
      },
    ];

    for (const user of sampleUsers) {
      try {
        await usersService.create(user);
        console.log(`Seeded user: ${user.displayName}`);
      } catch (error) {
        console.error(`Error seeding user ${user.displayName}:`, error);
      }
    }
  },

  async seedAll() {
    const hospitals = await this.seedHospitals();
    await this.seedUsers(hospitals);
  },
};

// Import types (you'll need to define these in your types file)
import type { Patient, DietPlan, Consultation, MessMenu, Vitals, MealTracking, PatientFeedback, FoodItem, User, Hospital } from './types';