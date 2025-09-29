export type Meal = {
  time: string;
  name: string;
  items: string[];
  notes?: string;
};

export type DietDay = {
  day: string;
  meals: Meal[];
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  dietaryHabits?: string;
  allergies?: string[];
  medicalHistory?: string;
  currentMedications?: string;
  doshaType?: 'Vata' | 'Pitta' | 'Kapha' | 'Mixed';
  hospitalId?: string;
  dietitianId?: string;
  registrationDate: Date;
  lastUpdated: Date;
};

export type Role = 'patient' | 'dietitian' | 'hospital';

export type DietPlan = {
  id: string;
  patientId: string;
  dietitianId: string;
  title: string;
  description: string;
  dietDays: DietDay[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type Consultation = {
  id: string;
  patientId: string;
  dietitianId: string;
  date: Date;
  notes: string;
  recommendations: string;
  followUpDate?: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
};

export type MealTracking = {
  id: string;
  patientId: string;
  dietPlanId: string;
  mealId: string; // References a specific meal in the diet plan
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  scheduledDate: Date;
  givenBy?: string; // Hospital staff who gave the meal
  givenAt?: Date;
  eatenBy?: 'patient' | 'family' | 'not_eaten';
  eatenAt?: Date;
  quantity?: 'full' | 'half' | 'quarter' | 'none';
  notes?: string; // Remarks like "patient requested lighter portion"
  status: 'scheduled' | 'given' | 'eaten' | 'skipped' | 'modified';
};

export type PatientFeedback = {
  id: string;
  patientId: string;
  dietPlanId: string;
  date: Date;
  mealAdherence: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  };
  symptoms: string[]; // e.g., ['nausea', 'headache', 'fatigue']
  energyLevel: 1 | 2 | 3 | 4 | 5; // 1=Very Low, 5=Excellent
  digestion: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
  waterIntake: number; // glasses per day
  sleepQuality: 1 | 2 | 3 | 4 | 5; // 1=Very Poor, 5=Excellent
  overallFeeling: 'much_better' | 'better' | 'same' | 'worse' | 'much_worse';
  additionalNotes?: string;
};


export type Vitals = {
  id: string;
  patientId: string;
  recordedBy: string; // nurse/doctor ID
  date: Date;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  bloodSugar?: {
    fasting: number;
    postPrandial?: number;
  };
  thyroid?: {
    tsh: number;
    t3?: number;
    t4?: number;
  };
  cholesterol?: {
    total: number;
    hdl: number;
    ldl: number;
    triglycerides: number;
  };
  bmi: number;
  weight: number;
  height: number;
  temperature?: number;
  pulse?: number;
  notes?: string;
};

export type MessMenu = {
  id: string;
  hospitalId: string;
  date: Date;
  meals: {
    breakfast: MessMenuItem[];
    lunch: MessMenuItem[];
    dinner: MessMenuItem[];
    snacks?: MessMenuItem[];
  };
  createdBy: string;
  lastUpdated: Date;
  isActive?: boolean;
};

export type MessMenuItem = {
  name: string;
  description?: string;
  nutritionalData?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  ayurvedicProperties?: {
    rasa: string[]; // sweet, sour, salty, bitter, pungent, astringent
    virya: 'hot' | 'cold';
    guna: string[]; // heavy, light, oily, dry, etc.
    vipaka: 'sweet' | 'sour' | 'pungent';
    digestibility: 'easy' | 'moderate' | 'difficult';
  };
  allergens?: string[];
  suitableFor?: ('Vata' | 'Pitta' | 'Kapha')[];
};


export type User = {
  id: string;
  email: string;
  role: 'patient' | 'dietitian' | 'hospital' | 'admin';
  name: string;
  phone?: string;
  hospitalId?: string;
  registrationDate: Date;
  lastLogin?: Date;
  isActive: boolean;
};
