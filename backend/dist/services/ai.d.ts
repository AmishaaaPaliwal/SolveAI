declare class AIService {
    private model;
    constructor();
    /**
     * Generate personalized Ayurvedic diet plan
     */
    generateDietPlan(patientData: {
        profile: any;
        vitals: any;
        messMenu: any;
        ayurvedicPrinciples: string;
    }): Promise<{
        dietChart: string;
        recommendations: string[];
        warnings: string[];
    }>;
    /**
     * Analyze patient dosha based on symptoms and characteristics
     */
    analyzeDosha(patientData: {
        symptoms: string[];
        characteristics: string[];
        preferences: string[];
    }): Promise<{
        primaryDosha: 'Vata' | 'Pitta' | 'Kapha';
        secondaryDosha?: 'Vata' | 'Pitta' | 'Kapha';
        imbalanceScore: number;
        recommendations: string[];
    }>;
    /**
     * Suggest food alternatives based on Ayurvedic principles
     */
    suggestAlternatives(foodName: string, reason: string): Promise<{
        alternatives: Array<{
            name: string;
            reason: string;
            ayurvedicBenefit: string;
        }>;
    }>;
    /**
     * Generate meal timing recommendations
     */
    generateMealTimings(doshaType: string, dailyRoutine: string): Promise<{
        schedule: Array<{
            meal: string;
            time: string;
            notes: string;
        }>;
        rationale: string;
    }>;
    /**
     * Health check for AI service
     */
    healthCheck(): Promise<boolean>;
}
export declare const aiService: AIService;
export default aiService;
//# sourceMappingURL=ai.d.ts.map