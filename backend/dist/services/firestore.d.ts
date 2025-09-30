export declare class FirestoreService {
    static create<T extends {
        id?: string;
    }>(collectionName: string, data: Omit<T, 'id'>): Promise<T>;
    static getById<T>(collectionName: string, id: string): Promise<T | null>;
    static getAll<T>(collectionName: string, queryBuilder?: (query: any) => any): Promise<T[]>;
    static update<T extends {
        id: string;
    }>(collectionName: string, id: string, data: Partial<Omit<T, 'id'>>): Promise<void>;
    static delete(collectionName: string, id: string): Promise<void>;
}
export declare const patientsService: {
    getAll: () => Promise<Patient[]>;
    getById: (id: string) => Promise<Patient | null>;
    getByDietitian: (dietitianId: string) => Promise<Patient[]>;
    create: (data: Omit<Patient, "id">) => Promise<Patient>;
    update: (id: string, data: Partial<Omit<Patient, "id">>) => Promise<void>;
    delete: (id: string) => Promise<void>;
};
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
export {};
//# sourceMappingURL=firestore.d.ts.map