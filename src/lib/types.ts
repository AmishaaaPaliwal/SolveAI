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
};

export type Role = 'patient' | 'dietitian' | 'hospital';
