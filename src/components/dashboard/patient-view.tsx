"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DietChart } from "./diet-chart";
import { PersonalChatbot } from "./personal-chatbot";
import { PatientProgress } from "./patient-progress";
import { PatientFeedbackForm } from "./patient-feedback-form";
import { BookOpen, MessageCircle, BarChart3, UtensilsCrossed, Hospital, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { patientsService } from "@/lib/firestore";
import type { Patient } from "@/lib/types";

export function PatientView() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        // In a real app, this would come from auth context
        // For now, we'll assume the first patient or use a patient code from URL/localStorage
        const patients = await patientsService.getAll();
        if (patients.length > 0) {
          setPatient(patients[0]); // Use first patient for demo
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatientData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your health dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hospital className="h-5 w-5" />
            Health Dashboard
          </CardTitle>
          <CardDescription>
            Welcome back{patient?.name ? `, ${patient.name}` : ''}! Here's your Ayurvedic health journey overview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Hospital className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Hospital Status</p>
                <span className="text-sm text-muted-foreground">
                  {patient ? (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Linked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Not Linked
                    </Badge>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Diet Plan</p>
                <span className="text-sm text-muted-foreground">
                  {patient ? (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Progress</p>
                <span className="text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    Track Now
                  </Badge>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="diet" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="diet" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="hidden sm:inline">Diet Plan</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Chatbot</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Learn</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diet" className="space-y-4">
          <DietChart />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <PatientProgress />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <PatientFeedbackForm patientId={patient?.id} />
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4">
          <PersonalChatbot />
        </TabsContent>

        <TabsContent value="learn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Ayurvedic Learning Hub
              </CardTitle>
              <CardDescription>
                Deepen your understanding of Ayurveda and holistic health practices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Understanding Doshas</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn about Vata, Pitta, and Kapha - the three fundamental energies in Ayurveda.
                  </p>
                  <Button variant="outline" size="sm">Start Learning</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Seasonal Eating</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Discover how to eat according to seasons for optimal health and digestion.
                  </p>
                  <Button variant="outline" size="sm">Explore</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Ayurvedic Nutrition</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Understand the six tastes (Rasa) and their impact on your well-being.
                  </p>
                  <Button variant="outline" size="sm">Learn More</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Daily Routines</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Incorporate Ayurvedic daily practices (Dinacharya) for better health.
                  </p>
                  <Button variant="outline" size="sm">View Guide</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
