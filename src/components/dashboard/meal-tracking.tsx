"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, User, Utensils, XCircle, AlertCircle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { mealTrackingService } from "@/lib/firestore";
import type { MealTracking, Patient, DietPlan } from "@/lib/types";

interface MealTrackingProps {
  patient: Patient;
  dietPlan: DietPlan;
}

function MealStatusBadge({ status }: { status: MealTracking['status'] }) {
  const statusConfig = {
    scheduled: { label: 'Scheduled', icon: Clock, variant: 'secondary' as const },
    given: { label: 'Given', icon: CheckCircle, variant: 'default' as const },
    eaten: { label: 'Eaten', icon: CheckCircle, variant: 'default' as const },
    skipped: { label: 'Skipped', icon: XCircle, variant: 'destructive' as const },
    modified: { label: 'Modified', icon: AlertCircle, variant: 'outline' as const },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function QuantityBadge({ quantity }: { quantity?: MealTracking['quantity'] }) {
  if (!quantity) return null;

  const quantityLabels = {
    full: 'Full',
    half: 'Half',
    quarter: 'Quarter',
    none: 'None',
  };

  return (
    <Badge variant="outline" className="text-xs">
      {quantityLabels[quantity]}
    </Badge>
  );
}

export function MealTrackingComponent({ patient, dietPlan }: MealTrackingProps) {
  const { toast } = useToast();
  const [mealTracking, setMealTracking] = useState<MealTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  useEffect(() => {
    loadMealTracking();

    // Set up real-time subscription if enabled
    let unsubscribe: (() => void) | undefined;
    if (realTimeEnabled) {
      unsubscribe = mealTrackingService.subscribe(patient.id, (meals) => {
        setMealTracking(meals);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [patient.id, realTimeEnabled]);

  const loadMealTracking = async () => {
    try {
      setIsLoading(true);
      const todayMeals = await mealTrackingService.getTodayMeals(patient.id);
      setMealTracking(todayMeals);
    } catch (error) {
      console.error('Error loading meal tracking:', error);
      toast({
        title: "Error",
        description: "Failed to load meal tracking data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsGiven = async (mealTrackingId: string) => {
    try {
      await mealTrackingService.markAsGiven(mealTrackingId, 'hospital-staff');
      toast({
        title: "Meal Marked as Given",
        description: "The meal has been marked as served to the patient.",
      });
      loadMealTracking(); // Refresh data
    } catch (error) {
      console.error('Error marking meal as given:', error);
      toast({
        title: "Error",
        description: "Failed to mark meal as given.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsEaten = async (mealTrackingId: string, eatenBy: 'patient' | 'family', quantity: MealTracking['quantity']) => {
    try {
      await mealTrackingService.markAsEaten(mealTrackingId, eatenBy, quantity);
      toast({
        title: "Meal Status Updated",
        description: `Meal marked as ${quantity === 'none' ? 'skipped' : `eaten (${quantity}) by ${eatenBy}`}.`,
      });
      loadMealTracking(); // Refresh data
    } catch (error) {
      console.error('Error marking meal as eaten:', error);
      toast({
        title: "Error",
        description: "Failed to update meal status.",
        variant: "destructive",
      });
    }
  };

  // Generate meal tracking records for today's diet plan
  const generateTodayMeals = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if meals are already tracked for today
      const existingMeals = mealTracking.filter(meal => {
        const mealDate = meal.scheduledDate instanceof Date ? meal.scheduledDate : new Date(meal.scheduledDate);
        return mealDate.toDateString() === today.toDateString();
      });

      if (existingMeals.length > 0) {
        toast({
          title: "Meals Already Tracked",
          description: "Today's meals are already being tracked.",
        });
        return;
      }

      // Generate meal tracking records for each meal in the diet plan
      const mealPromises = [];

      for (const day of dietPlan.dietDays) {
        for (const meal of day.meals) {
          const mealTrackingData: Omit<MealTracking, 'id'> = {
            patientId: patient.id,
            dietPlanId: dietPlan.id,
            mealId: `${dietPlan.id}-${day.day}-${meal.time}`, // Generate unique meal ID
            mealType: meal.time.toLowerCase().includes('breakfast') ? 'breakfast' :
                     meal.time.toLowerCase().includes('lunch') ? 'lunch' :
                     meal.time.toLowerCase().includes('dinner') ? 'dinner' : 'snacks',
            scheduledDate: today,
            status: 'scheduled',
          };

          mealPromises.push(mealTrackingService.create(mealTrackingData));
        }
      }

      await Promise.all(mealPromises);

      toast({
        title: "Meals Generated",
        description: "Today's meal tracking has been set up.",
      });

      loadMealTracking(); // Refresh data
    } catch (error) {
      console.error('Error generating meals:', error);
      toast({
        title: "Error",
        description: "Failed to generate meal tracking.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Meal Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-secondary rounded w-24" />
                  <div className="h-3 bg-secondary rounded w-32" />
                </div>
                <div className="h-8 bg-secondary rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Meal Tracking - {patient.name}
            </CardTitle>
            <CardDescription>
              Track meal service and consumption for today's diet plan
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="realtime-toggle" className="text-sm">
                {realTimeEnabled ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
              </Label>
              <Switch
                id="realtime-toggle"
                checked={realTimeEnabled}
                onCheckedChange={setRealTimeEnabled}
              />
              <Label htmlFor="realtime-toggle" className="text-sm">
                Real-time
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMealTracking()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generate Today's Meals Button */}
        {mealTracking.length === 0 && (
          <div className="text-center py-6">
            <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No meals tracked for today.</p>
            <Button onClick={generateTodayMeals}>
              Generate Today's Meals
            </Button>
          </div>
        )}

        {/* Meal Tracking List */}
        {mealTracking.length > 0 && (
          <div className="space-y-3">
            {mealTracking.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium capitalize">{meal.mealType}</h4>
                    <MealStatusBadge status={meal.status} />
                    {meal.quantity && <QuantityBadge quantity={meal.quantity} />}
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    {meal.givenBy && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Given by {meal.givenBy} at {meal.givenAt ? new Date(meal.givenAt).toLocaleTimeString() : 'Unknown'}
                      </div>
                    )}

                    {meal.eatenBy && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {meal.quantity === 'none' ? 'Skipped' : `Eaten by ${meal.eatenBy}`}
                        {meal.eatenAt && ` at ${new Date(meal.eatenAt).toLocaleTimeString()}`}
                      </div>
                    )}

                    {meal.notes && (
                      <div className="text-xs italic">Note: {meal.notes}</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {meal.status === 'scheduled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsGiven(meal.id)}
                    >
                      Mark Given
                    </Button>
                  )}

                  {meal.status === 'given' && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsEaten(meal.id, 'patient', 'full')}
                      >
                        Eaten (Full)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsEaten(meal.id, 'patient', 'half')}
                      >
                        Eaten (Half)
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleMarkAsEaten(meal.id, 'patient', 'none')}
                      >
                        Skipped
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}