import type { DietDay, Patient } from './types';

export const mockPatients: Patient[] = [
  { id: '1', name: 'Aarav Sharma', age: 45, gender: 'Male', code: 'AS823P' },
  { id: '2', name: 'Priya Patel', age: 32, gender: 'Female', code: 'PP192D' },
  { id: '3', name: 'Rohan Mehta', age: 68, gender: 'Male', code: 'RM021H' },
  { id: '4', name: 'Saanvi Gupta', age: 29, gender: 'Female', code: 'SG554F' },
];

export const mockDietChart: DietDay[] = [
  {
    day: 'Monday',
    meals: [
      { time: '08:00 AM', name: 'Breakfast', items: ['Oats Upma', 'Herbal Tea'], notes: 'Light and easy to digest.' },
      { time: '11:00 AM', name: 'Mid-Morning Snack', items: ['Apple'], notes: 'Pacifies Pitta dosha.' },
      { time: '01:00 PM', name: 'Lunch', items: ['Brown Rice', 'Moong Dal', 'Mixed Vegetable Sabzi', 'Cucumber Raita'] },
      { time: '04:00 PM', name: 'Evening Snack', items: ['Handful of Almonds', 'Green Tea'] },
      { time: '07:00 PM', name: 'Dinner', items: ['Quinoa Khichdi', 'Steamed Vegetables'], notes: 'Keep dinner light.' },
    ],
  },
  {
    day: 'Tuesday',
    meals: [
      { time: '08:00 AM', name: 'Breakfast', items: ['Ragi Dosa', 'Coconut Chutney'], notes: 'Rich in calcium.' },
      { time: '11:00 AM', name: 'Mid-Morning Snack', items: ['Pomegranate'] },
      { time: '01:00 PM', name: 'Lunch', items: ['Millet Roti', 'Toor Dal', 'Bhindi Sabzi', 'Salad'] },
      { time: '04:00 PM', name: 'Evening Snack', items: ['Buttermilk (Chaas)'] },
      { time: '07:00 PM', name: 'Dinner', items: ['Vegetable Soup', 'Toasted Brown Bread'] },
    ],
  },
];
