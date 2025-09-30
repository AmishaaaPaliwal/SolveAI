"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  User,
  BarChart3
} from "lucide-react";
import { patientsService, vitalsService, consultationsService, patientFeedbackService } from "@/lib/firestore";
import type { Patient, Vitals, PatientFeedback } from "@/lib/types";

interface PatientProgressProps {
  patientId?: string; // If provided, show specific patient, otherwise show overview
}

export function PatientProgress({ patientId }: PatientProgressProps) {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<Vitals[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<PatientFeedback[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to safely convert dates
  const formatDate = (date: any): string => {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    if (date && typeof date === 'object' && 'toDate' in date) {
      return date.toDate().toLocaleDateString();
    }
    return 'Invalid Date';
  };

  useEffect(() => {
    if (patientId) {
      loadPatientData(patientId);
    } else {
      loadAllPatients();
    }
  }, [patientId]);

  const loadAllPatients = async () => {
    try {
      setIsLoading(true);
      const patientsData = await patientsService.getAll();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientData = async (id: string) => {
    try {
      setIsLoading(true);
      const patient = await patientsService.getById(id);
      setSelectedPatient(patient);

      if (patient) {
        // Load all related data
        const [vitals, feedback, consults] = await Promise.all([
          vitalsService.getByPatient(id),
          patientFeedbackService.getByPatient(id),
          consultationsService.getByPatient(id)
        ]);

        setVitalsHistory(vitals);
        setFeedbackHistory(feedback);
        setConsultations(consults);
      }
    } catch (error: any) {
      console.error('Error loading patient data:', error);
      if (error.message && error.message.includes('requires an index')) {
        toast({
          title: "Data Loading",
          description: "Progress data may take a moment to load while database optimizes.",
          variant: "default",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgressMetrics = () => {
    if (!selectedPatient || vitalsHistory.length === 0) return null;

    const latestVitals = vitalsHistory[0]; // Already sorted by date desc
    const firstVitals = vitalsHistory[vitalsHistory.length - 1];

    const weightChange = latestVitals.weight - firstVitals.weight;
    const bmiChange = latestVitals.bmi - firstVitals.bmi;

    // Calculate average feedback scores
    const avgEnergy = feedbackHistory.length > 0
      ? feedbackHistory.reduce((sum, f) => sum + f.energyLevel, 0) / feedbackHistory.length
      : 0;

    const avgDigestion = feedbackHistory.length > 0
      ? feedbackHistory.reduce((sum, f) => {
          const score = f.digestion === 'excellent' ? 5 :
                       f.digestion === 'good' ? 4 :
                       f.digestion === 'fair' ? 3 :
                       f.digestion === 'poor' ? 2 : 1;
          return sum + score;
        }, 0) / feedbackHistory.length
      : 0;

    return {
      weightChange,
      bmiChange,
      avgEnergy,
      avgDigestion,
      totalConsultations: consultations.length,
      totalFeedback: feedbackHistory.length,
    };
  };

  const getProgressColor = (change: number) => {
    if (Math.abs(change) < 0.5) return 'text-blue-600'; // Stable
    return change > 0 ? 'text-red-600' : 'text-green-600'; // Increase/Decrease
  };

  const getProgressIcon = (change: number) => {
    if (Math.abs(change) < 0.5) return <Activity className="h-4 w-4" />;
    return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Patient Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-secondary rounded animate-pulse w-1/4" />
                <div className="h-8 bg-secondary rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Patient selection view
  if (!selectedPatient && !patientId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Patient Progress Analytics
          </CardTitle>
          <CardDescription>
            Select a patient to view their progress over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length > 0 ? (
            <div className="space-y-3">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Code: {patient.code} • Age: {patient.age}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => loadPatientData(patient.id)}
                  >
                    View Progress
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No patients found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Individual patient progress view
  const metrics = calculateProgressMetrics();

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progress: {selectedPatient?.name}
              </CardTitle>
              <CardDescription>
                Track improvements and monitor patient health metrics over time
              </CardDescription>
            </div>
            {!patientId && (
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                ← Back to Patients
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weight Change</p>
                  <p className={`text-2xl font-bold ${getProgressColor(metrics.weightChange)}`}>
                    {metrics.weightChange > 0 ? '+' : ''}{metrics.weightChange.toFixed(1)} kg
                  </p>
                </div>
                {getProgressIcon(metrics.weightChange)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">BMI Change</p>
                  <p className={`text-2xl font-bold ${getProgressColor(metrics.bmiChange)}`}>
                    {metrics.bmiChange > 0 ? '+' : ''}{metrics.bmiChange.toFixed(1)}
                  </p>
                </div>
                {getProgressIcon(metrics.bmiChange)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Energy</p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.avgEnergy.toFixed(1)}/5
                  </p>
                </div>
                <Activity className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consultations</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics.totalConsultations}
                  </p>
                </div>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Progress Tabs */}
      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vitals">Vitals History</TabsTrigger>
          <TabsTrigger value="feedback">Patient Feedback</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vitals Progress</CardTitle>
              <CardDescription>Track changes in vital signs over time</CardDescription>
            </CardHeader>
            <CardContent>
              {vitalsHistory.length > 0 ? (
                <div className="space-y-4">
                  {vitalsHistory.slice(0, 5).map((vitals, index) => (
                    <div key={vitals.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {formatDate(vitals.date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            BP: {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic} •
                            Weight: {vitals.weight}kg • BMI: {vitals.bmi}
                          </p>
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge variant="default">Latest</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No vitals recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Feedback</CardTitle>
              <CardDescription>Monitor patient-reported symptoms and wellbeing</CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackHistory.length > 0 ? (
                <div className="space-y-4">
                  {feedbackHistory.slice(0, 5).map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">
                          {formatDate(feedback.date)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Energy: {feedback.energyLevel}/5</Badge>
                          <Badge variant={
                            feedback.digestion === 'excellent' || feedback.digestion === 'good' ? 'default' :
                            feedback.digestion === 'fair' ? 'secondary' : 'destructive'
                          }>
                            Digestion: {feedback.digestion}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Meal Adherence:</span>
                          <div className="flex gap-1 mt-1">
                            {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
                              <Badge
                                key={meal}
                                variant={feedback.mealAdherence[meal as keyof typeof feedback.mealAdherence] ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {meal}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-medium">Water Intake:</span>
                          <p>{feedback.waterIntake} glasses/day</p>
                        </div>
                      </div>

                      {feedback.symptoms.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Symptoms:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {feedback.symptoms.map(symptom => (
                              <Badge key={symptom} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No feedback recorded yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Patient feedback will appear here once they start logging their progress.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Consultation Timeline</CardTitle>
              <CardDescription>Review consultation history and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.slice(0, 5).map((consultation) => (
                    <div key={consultation.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            Consultation #{consultation.id.slice(-6)}
                          </p>
                          <Badge variant={consultation.status === 'completed' ? 'default' : 'secondary'}>
                            {consultation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {consultation.date.toDate().toLocaleDateString()}
                        </p>
                        {consultation.notes && (
                          <p className="text-sm line-clamp-2">{consultation.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No consultations recorded.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}