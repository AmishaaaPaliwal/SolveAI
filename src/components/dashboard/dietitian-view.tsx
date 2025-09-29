"use client";

import { useState, useEffect } from "react";
import { patientsService, vitalsService, messMenusService, dietPlansService, consultationsService } from "@/lib/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateInitialDietChart } from "@/ai/flows/generate-initial-diet-chart";
import { User, Bot, Loader2, FileText, CheckCircle, XCircle, Stethoscope, Calendar, Search, Plus } from "lucide-react";
import { Label } from "../ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Patient, Vitals, MessMenu, DietPlan } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

function DietGenerationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientVitals, setPatientVitals] = useState<Vitals | null>(null);
  const [currentMenu, setCurrentMenu] = useState<MessMenu | null>(null);
  const [generatedChart, setGeneratedChart] = useState<DietPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        // For now, load all patients. In production, filter by assigned dietitian
        const patientsData = await patientsService.getAll();
        setPatients(patientsData);
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    };
    loadPatients();
  }, []);

  const handlePatientSelect = async (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient || null);

    if (patient) {
      try {
        // Load latest vitals
        const vitals = await vitalsService.getLatest(patient.id);
        setPatientVitals(vitals.length > 0 ? vitals[0] : null);

        // Load current mess menu
        const hospitalId = patient.hospitalId || 'default-hospital';
        const menu = await messMenusService.getTodayMenu(hospitalId);
        setCurrentMenu(menu.length > 0 ? menu[0] : null);
      } catch (error: any) {
        console.error('Error loading patient data:', error);
        if (error.message && error.message.includes('requires an index')) {
          console.warn('Database index is building. Menu loading may be slower temporarily.');
          toast({
            title: "Index Building",
            description: "Database optimization in progress. Some features may load slower.",
            variant: "default",
          });
        }
      }
    }
  };

  const generateDietChart = async () => {
    if (!selectedPatient) return;

    setIsLoading(true);
    setGeneratedChart(null);

    try {
      // Prepare data for AI generation
      const userProfile = `${selectedPatient.name}, ${selectedPatient.age} years old, ${selectedPatient.gender}, ${selectedPatient.dietaryHabits || 'No specific dietary habits mentioned'}`;

      const vitals = patientVitals ?
        `Height: ${patientVitals.height}cm, Weight: ${patientVitals.weight}kg, BMI: ${patientVitals.bmi}, BP: ${patientVitals.bloodPressure.systolic}/${patientVitals.bloodPressure.diastolic}, Temperature: ${patientVitals.temperature || 'Not recorded'}°C, Pulse: ${patientVitals.pulse || 'Not recorded'} bpm` :
        'Vitals not available';

      const messMenu = currentMenu ?
        currentMenu.meals.breakfast.map(item => item.name).join(', ') + '; ' +
        currentMenu.meals.lunch.map(item => item.name).join(', ') + '; ' +
        currentMenu.meals.dinner.map(item => item.name).join(', ') :
        'Mess menu not available';

      const ayurvedicPrinciples = selectedPatient.doshaType ?
        `Focus on ${selectedPatient.doshaType}-pacifying diet. ${selectedPatient.allergies?.length ? `Avoid: ${selectedPatient.allergies.join(', ')}.` : ''} Consider individual constitution and current health status.` :
        'General Ayurvedic principles: Balance all doshas, include all six tastes, eat according to digestive capacity.';

      const result = await generateInitialDietChart({
        userProfile,
        vitals,
        messMenu,
        ayurvedicPrinciples,
      });

      // Create diet plan object
      const dietPlan: Omit<DietPlan, 'id'> = {
        patientId: selectedPatient.id,
        dietitianId: 'current-dietitian', // Should come from auth
        title: `Diet Plan for ${selectedPatient.name}`,
        description: `AI-generated diet plan based on patient profile, vitals, and available mess menu.`,
        dietDays: [], // Will be parsed from the AI response
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: false, // Will be activated after review
      };

      setGeneratedChart(dietPlan as DietPlan);
      setGeneratedChart({ ...dietPlan, dietChart: result.dietChart } as any);

      toast({
        title: "Diet Chart Generated",
        description: "AI has generated a personalized diet chart. Review and save it.",
      });

    } catch (error) {
      console.error('Error generating diet chart:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate diet chart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveDietPlan = async () => {
    if (!generatedChart || !selectedPatient) return;

    setIsSaving(true);
    try {
      const savedPlan = await dietPlansService.create({
        patientId: selectedPatient.id,
        dietitianId: 'current-dietitian', // Should come from auth
        title: generatedChart.title,
        description: generatedChart.description,
        dietDays: generatedChart.dietDays,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });

      toast({
        title: "Diet Plan Saved",
        description: "The diet plan has been saved and activated for the patient.",
      });

      // Reset form
      setSelectedPatient(null);
      setPatientVitals(null);
      setCurrentMenu(null);
      setGeneratedChart(null);

    } catch (error) {
      console.error('Error saving diet plan:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save the diet plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Bot /> AI Diet Chart Generation</CardTitle>
          <CardDescription>
            Select a patient to generate a personalized Ayurvedic diet plan using AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patientSelect">Select Patient *</Label>
            <select
              id="patientSelect"
              className="w-full p-2 border rounded-md"
              onChange={(e) => handlePatientSelect(e.target.value)}
              value={selectedPatient?.id || ''}
            >
              <option value="">Choose a patient...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.code}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Summary */}
          {selectedPatient && (
            <Card className="bg-secondary/50">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Patient Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Profile:</span> {selectedPatient.age} years, {selectedPatient.gender}
                  </div>
                  <div>
                    <span className="font-medium">Vitals:</span> {patientVitals ? 'Available' : 'Not available'}
                  </div>
                  <div>
                    <span className="font-medium">Mess Menu:</span> {currentMenu ? 'Available' : 'Not available'}
                  </div>
                  <div>
                    <span className="font-medium">Dosha:</span> {selectedPatient.doshaType || 'Not specified'}
                  </div>
                </div>
                {selectedPatient.dietaryHabits && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Dietary Habits:</span> {selectedPatient.dietaryHabits}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateDietChart}
            disabled={!selectedPatient || isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate AI Diet Chart
          </Button>
        </CardContent>
      </Card>

      {/* Generated Diet Chart */}
      {generatedChart && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Diet Chart
            </CardTitle>
            <CardDescription>
              Review the AI-generated diet plan before saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-body text-sm">
                {(generatedChart as any).dietChart || 'Diet chart content will be displayed here.'}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveDietPlan}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" />
                Save & Activate Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedChart(null)}
                disabled={isSaving}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PatientManagement() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            try {
                const patientsData = await patientsService.getAll();
                setPatients(patientsData);
            } catch (error) {
                console.error("Error fetching patients: ", error);
            }
            setIsLoading(false);
        };

        fetchPatients();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><User /> Patient Management</CardTitle>
                <CardDescription>View and manage your assigned patients.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Unique Code</TableHead>
                        <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                </TableRow>
                            ))
                        ) : patients.length > 0 ? (
                            patients.map((patient) => (
                            <TableRow key={patient.id}>
                                <TableCell className="font-medium">{patient.name}</TableCell>
                                <TableCell>{patient.age}</TableCell>
                                <TableCell>{patient.gender}</TableCell>
                                <TableCell className="font-mono">{patient.code}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm">View Details</Button>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No patients found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


function PatientConsultationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchedPatient, setSearchedPatient] = useState<Patient | null>(null);
  const [patientVitals, setPatientVitals] = useState<any>(null);
  const [consultationForm, setConsultationForm] = useState({
    currentHealthIssues: '',
    symptoms: '',
    illnesses: '',
    lifestylePatterns: '',
    digestionPatterns: '',
    remarks: '',
    followUpDate: '',
  });

  const handlePatientLookup = async (patientCode: string) => {
    if (!patientCode.trim()) {
      toast({
        title: "Patient Code Required",
        description: "Please enter a patient code to search.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Search for patient by code
      const patients = await patientsService.getAll();
      const patient = patients.find(p => p.code.toLowerCase() === patientCode.trim().toLowerCase());

      if (!patient) {
        toast({
          title: "Patient Not Found",
          description: `No patient found with code "${patientCode}". Please check the code and try again.`,
          variant: "destructive",
        });
        setSearchedPatient(null);
        return;
      }

      setSearchedPatient(patient);

      // Load patient's latest vitals
      try {
        const vitals = await vitalsService.getLatest(patient.id);
        setPatientVitals(vitals.length > 0 ? vitals[0] : null);
      } catch (error: any) {
        console.warn('Could not load patient vitals:', error);
        if (error.message && error.message.includes('requires an index')) {
          toast({
            title: "Vitals Loading",
            description: "Patient vitals may take a moment to load while database optimizes.",
            variant: "default",
          });
        }
      }

      toast({
        title: "Patient Found",
        description: `${patient.name}'s profile has been loaded successfully.`,
      });

    } catch (error) {
      console.error('Error searching for patient:', error);
      toast({
        title: "Search Failed",
        description: "There was an error searching for the patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConsultation = async () => {
    if (!searchedPatient) return;

    setIsSaving(true);
    try {
      const consultationData = {
        patientId: searchedPatient.id,
        dietitianId: 'current-dietitian', // Should come from auth context
        date: new Date(),
        notes: `
Current Health Issues: ${consultationForm.currentHealthIssues}
Symptoms: ${consultationForm.symptoms}
Illnesses/Diseases: ${consultationForm.illnesses}
Lifestyle Patterns: ${consultationForm.lifestylePatterns}
Digestion Patterns: ${consultationForm.digestionPatterns}
Additional Remarks: ${consultationForm.remarks}
        `.trim(),
        recommendations: '', // Will be filled after AI analysis
        followUpDate: consultationForm.followUpDate ? new Date(consultationForm.followUpDate) : undefined,
        status: 'completed' as const,
      };

      await consultationsService.create(consultationData);

      toast({
        title: "Consultation Saved",
        description: "Patient consultation has been recorded successfully.",
      });

      // Reset form
      setSearchedPatient(null);
      setPatientVitals(null);
      setConsultationForm({
        currentHealthIssues: '',
        symptoms: '',
        illnesses: '',
        lifestylePatterns: '',
        digestionPatterns: '',
        remarks: '',
        followUpDate: '',
      });

    } catch (error) {
      console.error('Error saving consultation:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save the consultation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Code Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Search className="h-5 w-5" />
            Patient Consultation
          </CardTitle>
          <CardDescription>
            Enter the patient's unique code to start a consultation and record their health information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              placeholder="Enter Patient Code (e.g., PAT001A)"
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  handlePatientLookup(input.value);
                }
              }}
            />
            <Button
              onClick={() => {
                const input = document.querySelector('input[placeholder*="Patient Code"]') as HTMLInputElement;
                if (input) handlePatientLookup(input.value);
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Search className="mr-2 h-4 w-4" />
              Find Patient
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Profile Display */}
      {searchedPatient && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Patient Profile: {searchedPatient.name}</CardTitle>
            <CardDescription>Review patient demographics and current health information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Patient Code:</span>
                    <span className="font-mono font-medium">{searchedPatient.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span>{searchedPatient.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gender:</span>
                    <span>{searchedPatient.gender}</span>
                  </div>
                  {searchedPatient.doshaType && (
                    <div className="flex justify-between">
                      <span>Dosha Type:</span>
                      <span className="font-medium">{searchedPatient.doshaType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Contact & Health</h3>
                <div className="space-y-2 text-sm">
                  {searchedPatient.email && (
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span>{searchedPatient.email}</span>
                    </div>
                  )}
                  {searchedPatient.phone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{searchedPatient.phone}</span>
                    </div>
                  )}
                  {searchedPatient.dietaryHabits && (
                    <div>
                      <span className="block font-medium mb-1">Dietary Habits:</span>
                      <span className="text-muted-foreground">{searchedPatient.dietaryHabits}</span>
                    </div>
                  )}
                  {searchedPatient.allergies && searchedPatient.allergies.length > 0 && (
                    <div>
                      <span className="block font-medium mb-1">Allergies:</span>
                      <span className="text-muted-foreground">{searchedPatient.allergies.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Latest Vitals */}
            {patientVitals && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Latest Vitals</h3>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Weight:</span>
                      <p>{patientVitals.weight} kg</p>
                    </div>
                    <div>
                      <span className="font-medium">Height:</span>
                      <p>{patientVitals.height} cm</p>
                    </div>
                    <div>
                      <span className="font-medium">BMI:</span>
                      <p>{patientVitals.bmi}</p>
                    </div>
                    <div>
                      <span className="font-medium">Blood Pressure:</span>
                      <p>{patientVitals.bloodPressure.systolic}/{patientVitals.bloodPressure.diastolic} mmHg</p>
                    </div>
                    {patientVitals.temperature && (
                      <div>
                        <span className="font-medium">Temperature:</span>
                        <p>{patientVitals.temperature}°C</p>
                      </div>
                    )}
                    {patientVitals.pulse && (
                      <div>
                        <span className="font-medium">Pulse:</span>
                        <p>{patientVitals.pulse} bpm</p>
                      </div>
                    )}
                  </div>
                  {patientVitals.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="font-medium">Notes:</span>
                      <p className="text-muted-foreground mt-1">{patientVitals.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Consultation Form */}
      {searchedPatient && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Consultation Details
            </CardTitle>
            <CardDescription>
              Record the patient's current health status, symptoms, and consultation findings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="healthIssues">Current Health Issues / Symptoms</Label>
                  <Textarea
                    id="healthIssues"
                    placeholder="e.g., Joint pain, digestive issues, fatigue, skin problems..."
                    value={consultationForm.currentHealthIssues}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, currentHealthIssues: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="illnesses">Illnesses / Diseases</Label>
                  <Textarea
                    id="illnesses"
                    placeholder="e.g., Diabetes, Hypertension, Arthritis, Thyroid issues..."
                    value={consultationForm.illnesses}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, illnesses: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="lifestyle">Lifestyle Patterns</Label>
                  <Textarea
                    id="lifestyle"
                    placeholder="e.g., Sleep quality, exercise habits, stress levels, daily routine..."
                    value={consultationForm.lifestylePatterns}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, lifestylePatterns: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="symptoms">Specific Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="e.g., Headaches, nausea, constipation, irregular periods..."
                    value={consultationForm.symptoms}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, symptoms: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="digestion">Digestion & Bowel Patterns</Label>
                  <Textarea
                    id="digestion"
                    placeholder="e.g., Regular bowel movements, bloating, indigestion, appetite..."
                    value={consultationForm.digestionPatterns}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, digestionPatterns: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="followUp">Follow-up Date (Optional)</Label>
                  <Input
                    id="followUp"
                    type="date"
                    value={consultationForm.followUpDate}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="remarks">Additional Remarks / Observations</Label>
              <Textarea
                id="remarks"
                placeholder="Any additional observations, patient concerns, or important notes from the consultation..."
                value={consultationForm.remarks}
                onChange={(e) => setConsultationForm(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSaveConsultation}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Consultation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ConsultationsManagement() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      setIsLoading(true);
      try {
        // For now, load all consultations. In production, filter by assigned dietitian
        const consultationsData = await consultationsService.getAll();
        setConsultations(consultationsData);
      } catch (error) {
        console.error("Error fetching consultations: ", error);
      }
      setIsLoading(false);
    };

    fetchConsultations();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><Calendar /> Consultations</CardTitle>
        <CardDescription>Manage patient consultations and appointments.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {consultations.length} consultation{consultations.length !== 1 ? 's' : ''} scheduled
            </p>
            <Button size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule New
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-secondary rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-secondary rounded animate-pulse w-1/4" />
                    <div className="h-3 bg-secondary rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : consultations.length > 0 ? (
            <div className="space-y-3">
              {consultations.map((consultation) => (
                <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Consultation #{consultation.id.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">
                        {consultation.date.toDate().toLocaleDateString()} • {consultation.status}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No consultations scheduled.</p>
              <p className="text-sm text-muted-foreground">Schedule your first consultation.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DietitianView() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="consultation">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1">
          <TabsTrigger value="consultation" className="text-xs sm:text-sm py-2">
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">New Consultation</span>
            <span className="sm:hidden">Consult</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="text-xs sm:text-sm py-2">
            <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">My Patients</span>
            <span className="sm:hidden">Patients</span>
          </TabsTrigger>
          <TabsTrigger value="consultations" className="text-xs sm:text-sm py-2">
            <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Consultations</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
          <TabsTrigger value="generate-plan" className="text-xs sm:text-sm py-2">
            <Bot className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Generate Plans</span>
            <span className="sm:hidden">AI Plans</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="text-xs sm:text-sm py-2">
            <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Diet Plans</span>
            <span className="sm:hidden">Plans</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="consultation" className="mt-4 sm:mt-6">
          <PatientConsultationForm />
        </TabsContent>
        <TabsContent value="patients" className="mt-4 sm:mt-6">
          <PatientManagement />
        </TabsContent>
        <TabsContent value="consultations" className="mt-4 sm:mt-6">
          <ConsultationsManagement />
        </TabsContent>
        <TabsContent value="generate-plan" className="mt-4 sm:mt-6">
          <DietGenerationForm />
        </TabsContent>
        <TabsContent value="plans" className="mt-4 sm:mt-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Diet plans management coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
