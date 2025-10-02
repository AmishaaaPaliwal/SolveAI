export interface IFCFood {
    code: string;
    name: string;
    scie: string;
    regn: number;
    [key: string]: string | number;
}
export interface FoodSearchRequest {
    query: string;
    limit?: number;
}
export interface NutrientRangeRequest {
    nutrient: string;
    min: number;
    max: number;
    limit?: number;
}
//# sourceMappingURL=index.d.ts.map