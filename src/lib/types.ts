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

// Ayurvedic Properties
export type Rasa = 'Sweet' | 'Sour' | 'Salty' | 'Bitter' | 'Pungent' | 'Astringent';
export type Virya = 'Hot' | 'Cold';
export type Guna = 'Heavy' | 'Light' | 'Oily' | 'Dry' | 'Sharp' | 'Dull' | 'Static' | 'Mobile' | 'Soft' | 'Hard' | 'Clear' | 'Sticky';
export type Vipaka = 'Sweet' | 'Sour' | 'Pungent';
export type DoshaEffect = 'Vata-pacifying' | 'Vata-aggravating' | 'Pitta-pacifying' | 'Pitta-aggravating' | 'Kapha-pacifying' | 'Kapha-aggravating' | 'Tridoshic';

// Nutritional Data
export interface NutritionalData {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  potassium?: number; // mg
  calcium?: number; // mg
  iron?: number; // mg
  vitaminC?: number; // mg
  vitaminA?: number; // IU
}

// Ayurvedic Properties
export interface AyurvedicProperties {
  rasa: Rasa[];
  virya: Virya;
  guna: Guna[];
  vipaka: Vipaka;
  doshaEffect: DoshaEffect[];
  digestibility: 'Easy' | 'Moderate' | 'Difficult';
  seasonalSuitability?: ('Spring' | 'Summer' | 'Monsoon' | 'Autumn' | 'Winter')[];
  potency?: 'Mild' | 'Moderate' | 'Strong';
}

// Food Item in Database
export interface FoodItem {
  id: string;
  name: string;
  category: 'Vegetable' | 'Fruit' | 'Grain' | 'Dairy' | 'Meat' | 'Spice' | 'Oil' | 'Sweetener' | 'Beverage' | 'Other';
  nutritionalData: NutritionalData;
  ayurvedicProperties: AyurvedicProperties;
  commonAlternatives?: string[]; // IDs of alternative foods
  regionalVariations?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Mess Menu Item
export interface MessMenuItem {
  foodId?: string; // Reference to FoodItem
  name: string;
  quantity?: string; // e.g., "100g", "1 cup"
  portion?: string; // e.g., "small", "medium", "large"
  isAvailable: boolean;
  nutritionalData?: NutritionalData;
  ayurvedicProperties?: AyurvedicProperties;
  notes?: string; // Special preparation notes
}

// Mess Menu Structure
export interface MessMenu {
  id: string;
  hospitalId: string;
  date: Date;
  meals: {
    breakfast: MessMenuItem[];
    lunch: MessMenuItem[];
    dinner: MessMenuItem[];
    snacks: MessMenuItem[];
  };
  createdBy: string;
  lastUpdated: Date;
  isActive: boolean;
  version: number; // For tracking changes
  nutritionalSummary?: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  };
}

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
