// AI Service using LangChain + Vertex AI for Ayurvedic diet generation

import { ChatVertexAI } from '@langchain/google-vertexai';
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts';
import { redisService } from './redis';

class AIService {
  private model: ChatVertexAI;

  constructor() {
    this.model = new ChatVertexAI({
      model: 'gemini-1.5-pro',
      temperature: 0.3,
      maxOutputTokens: 2048,
      topK: 40,
      topP: 0.8,
    });
  }

  /**
   * Generate personalized Ayurvedic diet plan
   */
  async generateDietPlan(patientData: {
    profile: any;
    vitals: any;
    messMenu: any;
    ayurvedicPrinciples: string;
  }): Promise<{
    dietChart: string;
    recommendations: string[];
    warnings: string[];
  }> {
    try {
      // Check cache first
      const cacheKey = `diet_plan_${JSON.stringify(patientData)}`;
      const cachedResult = await redisService.getCachedAIResponse(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(`
You are an expert Ayurvedic dietitian with 20+ years of experience. Generate a personalized diet plan based on:

AYURVEDIC PRINCIPLES:
- Vata: Cold, light, dry qualities - needs warm, moist, grounding foods
- Pitta: Hot, sharp, oily qualities - needs cooling, mild foods
- Kapha: Heavy, cold, oily qualities - needs light, warm, stimulating foods

DIET PLAN STRUCTURE:
1. Daily meal schedule (breakfast, lunch, dinner, snacks)
2. Food portions and timing
3. Ayurvedic reasoning for each recommendation
4. Seasonal and constitutional considerations
5. Foods to avoid and alternatives

RESPONSE FORMAT:
Return a JSON object with:
- dietChart: Detailed markdown-formatted diet plan
- recommendations: Array of key recommendations
- warnings: Array of important warnings/cautions
        `),
        HumanMessagePromptTemplate.fromTemplate(`
PATIENT PROFILE:
{profile}

VITALS & HEALTH:
{vitals}

AVAILABLE MESS MENU:
{messMenu}

AYURVEDIC PRINCIPLES TO APPLY:
{principles}

Generate a comprehensive Ayurvedic diet plan for this patient.
        `)
      ]);

      const formattedPrompt = await prompt.formatMessages({
        profile: JSON.stringify(patientData.profile, null, 2),
        vitals: JSON.stringify(patientData.vitals, null, 2),
        messMenu: JSON.stringify(patientData.messMenu, null, 2),
        principles: patientData.ayurvedicPrinciples
      });

      const response = await this.model.invoke(formattedPrompt);
      const result = JSON.parse(response.content as string);

      // Cache the result
      await redisService.cacheAIResponse(cacheKey, result);

      return result;
    } catch (error) {
      console.error('AI Diet Generation Error:', error);
      throw new Error('Failed to generate diet plan. Please try again.');
    }
  }

  /**
   * Analyze patient dosha based on symptoms and characteristics
   */
  async analyzeDosha(patientData: {
    symptoms: string[];
    characteristics: string[];
    preferences: string[];
  }): Promise<{
    primaryDosha: 'Vata' | 'Pitta' | 'Kapha';
    secondaryDosha?: 'Vata' | 'Pitta' | 'Kapha';
    imbalanceScore: number;
    recommendations: string[];
  }> {
    try {
      const cacheKey = `dosha_analysis_${JSON.stringify(patientData)}`;
      const cachedResult = await redisService.getCachedAIResponse(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(`
You are an Ayurvedic practitioner specializing in dosha analysis. Analyze the patient's symptoms and characteristics to determine their dosha imbalance.

DOSHA CHARACTERISTICS:
- VATA: Anxiety, dry skin, constipation, irregular digestion, cold hands/feet, insomnia, weight loss
- PITTA: Acid reflux, skin rashes, irritability, excessive hunger, hot flashes, sharp digestion
- KAPHA: Weight gain, congestion, lethargy, slow digestion, water retention, depression

RESPONSE FORMAT:
Return JSON with:
- primaryDosha: Main imbalanced dosha
- secondaryDosha: Secondary imbalance (optional)
- imbalanceScore: 1-10 severity score
- recommendations: Array of dietary and lifestyle recommendations
        `),
        HumanMessagePromptTemplate.fromTemplate(`
PATIENT SYMPTOMS:
{symptoms}

CHARACTERISTICS:
{characteristics}

FOOD PREFERENCES:
{preferences}

Analyze the dosha imbalance and provide recommendations.
        `)
      ]);

      const formattedPrompt = await prompt.formatMessages({
        symptoms: patientData.symptoms.join(', '),
        characteristics: patientData.characteristics.join(', '),
        preferences: patientData.preferences.join(', ')
      });

      const response = await this.model.invoke(formattedPrompt);
      const result = JSON.parse(response.content as string);

      // Cache the result
      await redisService.cacheAIResponse(cacheKey, result);

      return result;
    } catch (error) {
      console.error('AI Dosha Analysis Error:', error);
      throw new Error('Failed to analyze dosha. Please try again.');
    }
  }

  /**
   * Suggest food alternatives based on Ayurvedic principles
   */
  async suggestAlternatives(foodName: string, reason: string): Promise<{
    alternatives: Array<{
      name: string;
      reason: string;
      ayurvedicBenefit: string;
    }>;
  }> {
    try {
      const cacheKey = `food_alternatives_${foodName}_${reason}`;
      const cachedResult = await redisService.getCachedAIResponse(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(`
You are an Ayurvedic nutrition expert. Suggest suitable food alternatives based on Ayurvedic principles.

Consider:
- Rasa (taste): Sweet, sour, salty, bitter, pungent, astringent
- Virya (potency): Hot/cold energy
- Guna (qualities): Heavy/light, oily/dry
- Vipaka (post-digestive effect): Sweet/sour/pungent

RESPONSE FORMAT:
Return JSON with alternatives array containing:
- name: Alternative food name
- reason: Why this is a good alternative
- ayurvedicBenefit: Ayurvedic benefit explanation
        `),
        HumanMessagePromptTemplate.fromTemplate(`
FOOD TO REPLACE: {foodName}
REASON FOR REPLACEMENT: {reason}

Suggest 3-5 suitable Ayurvedic alternatives.
        `)
      ]);

      const formattedPrompt = await prompt.formatMessages({
        foodName,
        reason
      });

      const response = await this.model.invoke(formattedPrompt);
      const result = JSON.parse(response.content as string);

      // Cache the result
      await redisService.cacheAIResponse(cacheKey, result);

      return result;
    } catch (error) {
      console.error('AI Food Alternatives Error:', error);
      throw new Error('Failed to suggest alternatives. Please try again.');
    }
  }

  /**
   * Generate meal timing recommendations
   */
  async generateMealTimings(doshaType: string, dailyRoutine: string): Promise<{
    schedule: Array<{
      meal: string;
      time: string;
      notes: string;
    }>;
    rationale: string;
  }> {
    try {
      const cacheKey = `meal_timings_${doshaType}_${dailyRoutine}`;
      const cachedResult = await redisService.getCachedAIResponse(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(`
You are an Ayurvedic time management expert. Create optimal meal timings based on dosha and daily routine.

DOSHA TIMING PREFERENCES:
- Vata: Regular, grounding routine (6-10 AM breakfast, 12-2 PM lunch, 6-8 PM dinner)
- Pitta: Avoid peak heat times, regular intervals
- Kapha: Early meals, avoid heavy evening meals

RESPONSE FORMAT:
Return JSON with:
- schedule: Array of meal timing objects
- rationale: Explanation of timing choices
        `),
        HumanMessagePromptTemplate.fromTemplate(`
DOSHA TYPE: {doshaType}
DAILY ROUTINE: {dailyRoutine}

Generate optimal meal timings for this constitution and lifestyle.
        `)
      ]);

      const formattedPrompt = await prompt.formatMessages({
        doshaType,
        dailyRoutine
      });

      const response = await this.model.invoke(formattedPrompt);
      const result = JSON.parse(response.content as string);

      // Cache the result
      await redisService.cacheAIResponse(cacheKey, result);

      return result;
    } catch (error) {
      console.error('AI Meal Timing Error:', error);
      throw new Error('Failed to generate meal timings. Please try again.');
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.model.invoke('Say "AI service is healthy" in exactly those words.');
      return response.content === 'AI service is healthy';
    } catch (error) {
      console.error('AI Health Check Failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;