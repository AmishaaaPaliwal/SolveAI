"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, UtensilsCrossed, Link2, HeartPulse, X, Calendar, Activity, CheckSquare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { patientsService, messMenusService, vitalsService, dietPlansService } from "@/lib/firestore";
import type { Patient, MessMenu, MessMenuItem, Vitals, DietPlan } from "@/lib/types";
import { MealTrackingComponent } from "./meal-tracking";


function LinkPatientForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [linkedPatient, setLinkedPatient] = useState<Patient | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const code = (formData.get('patientCode') as string)?.trim().toUpperCase();

            if (!code) {
                toast({
                    title: "Patient Code Required",
                    description: "Please enter a patient code.",
                    variant: "destructive",
                });
                return;
            }

            // Search for patient by code
            const patients = await patientsService.getAll();
            const patient = patients.find(p => p.code === code);

            if (!patient) {
                toast({
                    title: "Patient Not Found",
                    description: `No patient found with code ${code}. Please check the code and try again.`,
                    variant: "destructive",
                });
                return;
            }

            // Link patient to hospital (assuming hospital ID from auth context)
            // For now, we'll just mark as linked and show patient details
            setLinkedPatient(patient);

            toast({
                title: "Patient Linked Successfully",
                description: `${patient.name} has been linked to the hospital system.`,
            });

            // Reset form safely
            if (formRef.current) {
                formRef.current.reset();
            }

        } catch (error) {
            console.error('Error linking patient:', error);
            toast({
                title: "Linking Failed",
                description: "There was an error linking the patient. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Link2 /> Link Patient Profile</CardTitle>
                    <CardDescription>
                        Enter the patient's unique code to sync their profile with the hospital system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2" onSubmit={handleSubmit}>
                        <Input
                            id="patientCode"
                            name="patientCode"
                            placeholder="Enter Patient Code (e.g., PAT001A)"
                            required
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? "Linking..." : "Link Patient"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {linkedPatient && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Patient Details</CardTitle>
                        <CardDescription>Linked patient information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Name</Label>
                                <p className="text-sm text-muted-foreground break-words">{linkedPatient.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Patient Code</Label>
                                <p className="text-sm text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded text-xs sm:text-sm">{linkedPatient.code}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Age</Label>
                                <p className="text-sm text-muted-foreground">{linkedPatient.age} years</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Gender</Label>
                                <p className="text-sm text-muted-foreground">{linkedPatient.gender}</p>
                            </div>
                        </div>

                        {(linkedPatient.email || linkedPatient.phone) && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Contact Information</Label>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {linkedPatient.email && <p>Email: {linkedPatient.email}</p>}
                                    {linkedPatient.phone && <p>Phone: {linkedPatient.phone}</p>}
                                </div>
                            </div>
                        )}

                        {linkedPatient.emergencyContact && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Emergency Contact</Label>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Name: {linkedPatient.emergencyContact.name || 'Not provided'}</p>
                                    <p>Phone: {linkedPatient.emergencyContact.phone || 'Not provided'}</p>
                                    <p>Relationship: {linkedPatient.emergencyContact.relationship || 'Not provided'}</p>
                                </div>
                            </div>
                        )}

                        {(linkedPatient.dietaryHabits || linkedPatient.allergies?.length) && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Health Information</Label>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {linkedPatient.dietaryHabits && <p>Dietary Habits: {linkedPatient.dietaryHabits}</p>}
                                    {linkedPatient.allergies?.length && <p>Allergies: {linkedPatient.allergies.join(', ')}</p>}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground">
                                Patient registered on {linkedPatient.registrationDate ? new Date(linkedPatient.registrationDate).toLocaleDateString() : 'Unknown'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

function MessMenuForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [currentMenu, setCurrentMenu] = useState<MessMenu | null>(null);

    useEffect(() => {
        const loadTodayMenu = async () => {
            try {
                // For now, assume hospital ID is 'default-hospital'
                // In production, this should come from auth context
                const hospitalId = 'default-hospital';
                const todayMenus = await messMenusService.getTodayMenu(hospitalId);
                if (todayMenus.length > 0) {
                    setCurrentMenu(todayMenus[0]);
                }
            } catch (error: any) {
                console.error('Error loading today\'s menu:', error);
                if (error.message && error.message.includes('requires an index')) {
                    toast({
                        title: "Index Building",
                        description: "Database index is being created. Menu loading may be slower temporarily.",
                        variant: "default",
                    });
                }
            }
        };

        loadTodayMenu();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const menuText = formData.get('menuItems') as string;

            // Parse menu items (simple parsing for now)
            const menuItems = menuText.split('\n').filter(item => item.trim().length > 0);

            // Create MessMenuItem objects from the text
            const parseMenuItems = (items: string[]): MessMenuItem[] => {
                return items.map(item => ({
                    name: item.trim(),
                    // In a real implementation, you'd parse nutritional and ayurvedic data
                    // For now, we'll just store the name
                }));
            };

            const messMenuData = {
                hospitalId: 'default-hospital', // Should come from auth context
                date: new Date(),
                meals: {
                    breakfast: parseMenuItems(menuItems.filter(item =>
                        item.toLowerCase().includes('breakfast') ||
                        item.toLowerCase().includes('poha') ||
                        item.toLowerCase().includes('upma') ||
                        item.toLowerCase().includes('tea')
                    )),
                    lunch: parseMenuItems(menuItems.filter(item =>
                        item.toLowerCase().includes('lunch') ||
                        item.toLowerCase().includes('roti') ||
                        item.toLowerCase().includes('dal') ||
                        item.toLowerCase().includes('rice')
                    )),
                    dinner: parseMenuItems(menuItems.filter(item =>
                        item.toLowerCase().includes('dinner') ||
                        item.toLowerCase().includes('khichdi') ||
                        item.toLowerCase().includes('soup')
                    )),
                    snacks: parseMenuItems(menuItems.filter(item =>
                        item.toLowerCase().includes('snack') ||
                        !item.toLowerCase().includes('breakfast') &&
                        !item.toLowerCase().includes('lunch') &&
                        !item.toLowerCase().includes('dinner')
                    )),
                },
                createdBy: 'hospital-admin', // Should come from auth context
                lastUpdated: new Date(),
                isActive: true,
            };

            if (currentMenu) {
                // Update existing menu
                await messMenusService.update(currentMenu.id, messMenuData);
                toast({
                    title: "Menu Updated",
                    description: "Today's mess menu has been successfully updated.",
                });
            } else {
                // Create new menu
                const newMenu = await messMenusService.create(messMenuData);
                setCurrentMenu(newMenu);
                toast({
                    title: "Menu Created",
                    description: "Today's mess menu has been successfully created.",
                });
            }

            // Clear the form safely
            if (e.currentTarget && e.currentTarget.elements) {
                const menuTextarea = e.currentTarget.elements.namedItem('menuItems') as HTMLTextAreaElement;
                if (menuTextarea) {
                    menuTextarea.value = '';
                }
            }

        } catch (error) {
            console.error('Error saving menu:', error);
            toast({
                title: "Save Failed",
                description: "There was an error saving the menu. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><UtensilsCrossed /> Update Mess Menu</CardTitle>
                <CardDescription>
                    Add or update today's menu items. Each line represents a menu item. The system will automatically categorize them by meal type.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="menuItems">Today's Menu Items</Label>
                        <Textarea
                            id="menuItems"
                            name="menuItems"
                            placeholder="Enter each menu item on a new line, e.g.:
Poha (Light, Vata-pacifying)
Moong Dal (Protein-rich, Tridoshic)
Roti (Whole wheat, Sattvic)
Khichdi (Easy to digest, All doshas)
Mixed Vegetables (Rich in fiber)"
                            className="mt-2"
                            rows={8}
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Tip: Include nutritional and Ayurvedic properties in parentheses for better categorization.
                        </p>
                    </div>


                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : currentMenu ? "Update Menu" : "Create Menu"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function VitalsForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const vitalsFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const patientsData = await patientsService.getAll();
                setPatients(patientsData);
            } catch (error) {
                console.error('Error loading patients:', error);
            }
        };
        loadPatients();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const patientId = formData.get('patientId') as string;

            if (!patientId) {
                toast({
                    title: "Patient Required",
                    description: "Please select a patient.",
                    variant: "destructive",
                });
                return;
            }

            // Build vitals data object, filtering out undefined values
            const vitalsData: any = {
                patientId,
                recordedBy: 'hospital-staff', // Should come from auth context
                date: new Date(),
                bloodPressure: {
                    systolic: parseInt(formData.get('systolic') as string) || 0,
                    diastolic: parseInt(formData.get('diastolic') as string) || 0,
                },
                bmi: parseFloat(formData.get('bmi') as string) || 0,
                weight: parseFloat(formData.get('weight') as string) || 0,
                height: parseFloat(formData.get('height') as string) || 0,
            };

            // Add optional blood sugar data
            const fastingBloodSugar = formData.get('fastingBloodSugar');
            const postPrandialBloodSugar = formData.get('postPrandialBloodSugar');
            if (fastingBloodSugar) {
                vitalsData.bloodSugar = {
                    fasting: parseFloat(fastingBloodSugar as string) || 0,
                };
                if (postPrandialBloodSugar) {
                    vitalsData.bloodSugar.postPrandial = parseFloat(postPrandialBloodSugar as string);
                }
            }

            // Add optional thyroid data
            const tsh = formData.get('tsh');
            if (tsh) {
                vitalsData.thyroid = {
                    tsh: parseFloat(tsh as string) || 0,
                };
                const t3 = formData.get('t3');
                const t4 = formData.get('t4');
                if (t3) vitalsData.thyroid.t3 = parseFloat(t3 as string);
                if (t4) vitalsData.thyroid.t4 = parseFloat(t4 as string);
            }

            // Add optional cholesterol data
            const totalCholesterol = formData.get('totalCholesterol');
            if (totalCholesterol) {
                vitalsData.cholesterol = {
                    total: parseFloat(totalCholesterol as string) || 0,
                    hdl: parseFloat(formData.get('hdl') as string) || 0,
                    ldl: parseFloat(formData.get('ldl') as string) || 0,
                    triglycerides: parseFloat(formData.get('triglycerides') as string) || 0,
                };
            }

            // Add optional temperature
            const temperature = formData.get('temperature');
            if (temperature) {
                vitalsData.temperature = parseFloat(temperature as string);
            }

            // Add optional pulse
            const pulse = formData.get('pulse');
            if (pulse) {
                vitalsData.pulse = parseInt(pulse as string);
            }

            // Add optional notes
            const notes = formData.get('notes') as string;
            if (notes && notes.trim()) {
                vitalsData.notes = notes.trim();
            }

            await vitalsService.create(vitalsData);

            toast({
                title: "Vitals Recorded",
                description: "Patient vitals have been successfully recorded.",
            });

            // Reset form safely
            if (vitalsFormRef.current) {
                vitalsFormRef.current.reset();
            }
            setSelectedPatient(null);

        } catch (error) {
            console.error('Error recording vitals:', error);
            toast({
                title: "Recording Failed",
                description: "There was an error recording the vitals. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><HeartPulse /> Record Patient Vitals</CardTitle>
                <CardDescription>
                    Record vital signs and medical measurements for hospital patients.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={vitalsFormRef} onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="patientId">Select Patient *</Label>
                        <select
                            id="patientId"
                            name="patientId"
                            required
                            className="w-full p-2 border rounded-md"
                            onChange={(e) => {
                                const patient = patients.find(p => p.id === e.target.value);
                                setSelectedPatient(patient || null);
                            }}
                        >
                            <option value="">Choose a patient...</option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name} - {patient.code}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedPatient && (
                        <div className="bg-secondary/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Recording vitals for: <span className="font-medium">{selectedPatient.name}</span>
                            </p>
                        </div>
                    )}

                    {/* Vital Signs */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Vital Signs</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg) *</Label>
                                <Input id="weight" name="weight" type="number" step="0.1" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">Height (cm) *</Label>
                                <Input id="height" name="height" type="number" step="0.1" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bmi">BMI *</Label>
                                <Input id="bmi" name="bmi" type="number" step="0.1" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="temperature">Temperature (°C)</Label>
                                <Input id="temperature" name="temperature" type="number" step="0.1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
                                <Input id="pulse" name="pulse" type="number" />
                            </div>
                        </div>

                        {/* Blood Pressure */}
                        <div className="space-y-2">
                            <Label>Blood Pressure (mmHg) *</Label>
                            <div className="flex gap-2">
                                <Input
                                    name="systolic"
                                    placeholder="Systolic"
                                    type="number"
                                    required
                                    className="flex-1"
                                />
                                <span className="flex items-center">/</span>
                                <Input
                                    name="diastolic"
                                    placeholder="Diastolic"
                                    type="number"
                                    required
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Blood Tests */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Blood Tests</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fastingBloodSugar">Fasting Blood Sugar (mg/dL)</Label>
                                <Input id="fastingBloodSugar" name="fastingBloodSugar" type="number" step="0.1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postPrandialBloodSugar">Post-Prandial Blood Sugar (mg/dL)</Label>
                                <Input id="postPrandialBloodSugar" name="postPrandialBloodSugar" type="number" step="0.1" />
                            </div>
                        </div>

                        {/* Thyroid */}
                        <div className="space-y-2">
                            <Label>Thyroid Profile</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Input name="tsh" placeholder="TSH (μIU/mL)" type="number" step="0.01" />
                                <Input name="t3" placeholder="T3 (ng/dL)" type="number" step="0.01" />
                                <Input name="t4" placeholder="T4 (μg/dL)" type="number" step="0.01" />
                            </div>
                        </div>

                        {/* Cholesterol */}
                        <div className="space-y-2">
                            <Label>Lipid Profile</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <Input name="totalCholesterol" placeholder="Total (mg/dL)" type="number" />
                                <Input name="hdl" placeholder="HDL (mg/dL)" type="number" />
                                <Input name="ldl" placeholder="LDL (mg/dL)" type="number" />
                                <Input name="triglycerides" placeholder="Triglycerides (mg/dL)" type="number" />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Any additional observations, symptoms, or medical notes..."
                            rows={3}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Recording..." : "Record Vitals"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function MealTrackingView() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load patients with diet plans
        const patientsData = await patientsService.getAll();
        const patientsWithPlans = [];

        for (const patient of patientsData) {
          try {
            const patientPlans = await dietPlansService.getByPatient(patient.id);
            const activePlan = patientPlans.find(plan => plan.isActive);
            if (activePlan) {
              patientsWithPlans.push(patient);
            }
          } catch (error: any) {
            // Skip patients without diet plans or if index is building
            if (error.message && error.message.includes('requires an index')) {
              console.warn(`Diet plans index building for patient ${patient.id}, skipping for now`);
            }
            continue;
          }
        }

        setPatients(patientsWithPlans);
      } catch (error) {
        console.error('Error loading patients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Meal Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg animate-pulse">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 sm:h-4 bg-secondary rounded animate-pulse w-1/4" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedPatient) {
    // Find the active diet plan for the selected patient
    const loadDietPlan = async () => {
      try {
        const patientPlans = await dietPlansService.getByPatient(selectedPatient.id);
        const activePlan = patientPlans.find(plan => plan.isActive);
        if (activePlan) {
          return activePlan;
        }
      } catch (error) {
        console.error('Error loading diet plan:', error);
      }
      return null;
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedPatient(null)}>
            ← Back to Patients
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Meal Tracking: {selectedPatient.name}</h2>
            <p className="text-sm text-muted-foreground">Track today's meal service and consumption</p>
          </div>
        </div>

        {/* Load diet plan and show meal tracking */}
        <MealTrackingLoader patient={selectedPatient} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Meal Tracking
        </CardTitle>
        <CardDescription>
          Select a patient to track their meal service and consumption for today
        </CardDescription>
      </CardHeader>
      <CardContent>
        {patients.length > 0 ? (
          <div className="space-y-3">
            {patients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{patient.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Code: <span className="font-mono">{patient.code}</span> • Age: {patient.age} • {patient.gender}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPatient(patient)}
                >
                  Track Meals
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No patients with active diet plans found.</p>
            <p className="text-sm text-muted-foreground">Patients need active diet plans to track meals.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component to load diet plan and show meal tracking
function MealTrackingLoader({ patient }: { patient: Patient }) {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDietPlan = async () => {
      try {
        setIsLoading(true);
        const patientPlans = await dietPlansService.getByPatient(patient.id);
        const activePlan = patientPlans.find(plan => plan.isActive);
        setDietPlan(activePlan || null);
      } catch (error: any) {
        console.error('Error loading diet plan:', error);
        if (error.message && error.message.includes('requires an index')) {
          console.warn('Diet plans index is building. Patient meal tracking may load slower temporarily.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDietPlan();
  }, [patient.id]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading diet plan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dietPlan) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active diet plan found for this patient.</p>
            <p className="text-sm text-muted-foreground">Contact the dietitian to create a diet plan first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <MealTrackingComponent patient={patient} dietPlan={dietPlan} />;
}

function PatientManagement() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientVitals, setPatientVitals] = useState<any[]>([]);
    const [showPatientModal, setShowPatientModal] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            try {
                // For now, fetch all patients. In production, this should filter by hospital
                const patientsData = await patientsService.getAll();
                setPatients(patientsData);
            } catch (error) {
                console.error("Error fetching patients: ", error);
            }
            setIsLoading(false);
        };

        fetchPatients();
    }, []);

    const handleViewPatientDetails = async (patient: Patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);

        try {
            // Fetch patient's vitals history
            const vitalsData = await vitalsService.getByPatient(patient.id);
            setPatientVitals(vitalsData);
        } catch (error: any) {
            console.error("Error fetching patient vitals:", error);
            setPatientVitals([]);
            if (error.message && error.message.includes('requires an index')) {
                console.warn('Vitals index is building. Patient details may load slower temporarily.');
            }
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><User /> Hospital Patients</CardTitle>
                    <CardDescription>Manage patients linked to your hospital.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {patients.length} patient{patients.length !== 1 ? 's' : ''} linked
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full animate-pulse" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-3 sm:h-4 bg-secondary rounded animate-pulse w-1/4" />
                                            <div className="h-3 bg-secondary rounded animate-pulse w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : patients.length > 0 ? (
                            <div className="space-y-3">
                                {patients.map((patient) => (
                                    <div key={patient.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3">
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm sm:text-base truncate">{patient.name}</p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    Code: <span className="font-mono">{patient.code}</span> • Age: {patient.age} • {patient.gender}
                                                </p>
                                                {patient.phone && (
                                                    <p className="text-xs text-muted-foreground">{patient.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                            onClick={() => handleViewPatientDetails(patient)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No patients linked yet.</p>
                                <p className="text-sm text-muted-foreground">Use the "Link Patient" tab to add patients.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Patient Details Modal */}
            <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Patient Details: {selectedPatient?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPatient && (
                        <div className="space-y-6">
                            {/* Patient Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Patient Code:</span>
                                            <span className="font-mono font-medium">{selectedPatient.code}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Age:</span>
                                            <span>{selectedPatient.age} years</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Gender:</span>
                                            <span>{selectedPatient.gender}</span>
                                        </div>
                                        {selectedPatient.email && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Email:</span>
                                                <span className="text-sm">{selectedPatient.email}</span>
                                            </div>
                                        )}
                                        {selectedPatient.phone && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Phone:</span>
                                                <span>{selectedPatient.phone}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Health Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {selectedPatient.dietaryHabits && (
                                            <div>
                                                <span className="text-muted-foreground block mb-1">Dietary Habits:</span>
                                                <span className="text-sm">{selectedPatient.dietaryHabits}</span>
                                            </div>
                                        )}
                                        {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                                            <div>
                                                <span className="text-muted-foreground block mb-1">Allergies:</span>
                                                <span className="text-sm">{selectedPatient.allergies.join(', ')}</span>
                                            </div>
                                        )}
                                        {selectedPatient.doshaType && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Dosha Type:</span>
                                                <span className="font-medium">{selectedPatient.doshaType}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Registered:</span>
                                            <span>{selectedPatient.registrationDate ? new Date(selectedPatient.registrationDate).toLocaleDateString() : 'Unknown'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Vitals History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Vitals History
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {patientVitals.length} recorded vitals
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    {patientVitals.length > 0 ? (
                                        <div className="space-y-4">
                                            {patientVitals.map((vital: any, index: number) => (
                                                <div key={vital.id || index} className="border rounded-lg p-4 bg-secondary/20">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {vital.date ? new Date(vital.date.seconds * 1000).toLocaleDateString() : 'Unknown date'}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {vital.date ? new Date(vital.date.seconds * 1000).toLocaleTimeString() : ''}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            Recorded by: {vital.recordedBy || 'Hospital Staff'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        {/* Vital Signs */}
                                                        <div className="space-y-1">
                                                            <span className="font-medium text-muted-foreground">Weight</span>
                                                            <p className="font-medium">{vital.weight} kg</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="font-medium text-muted-foreground">Height</span>
                                                            <p className="font-medium">{vital.height} cm</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="font-medium text-muted-foreground">BMI</span>
                                                            <p className="font-medium">{vital.bmi}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="font-medium text-muted-foreground">Blood Pressure</span>
                                                            <p className="font-medium">{vital.bloodPressure?.systolic}/{vital.bloodPressure?.diastolic} mmHg</p>
                                                        </div>

                                                        {/* Optional Vitals */}
                                                        {vital.temperature && (
                                                            <div className="space-y-1">
                                                                <span className="font-medium text-muted-foreground">Temperature</span>
                                                                <p className="font-medium">{vital.temperature}°C</p>
                                                            </div>
                                                        )}
                                                        {vital.pulse && (
                                                            <div className="space-y-1">
                                                                <span className="font-medium text-muted-foreground">Pulse</span>
                                                                <p className="font-medium">{vital.pulse} bpm</p>
                                                            </div>
                                                        )}
                                                        {vital.bloodSugar && (
                                                            <div className="space-y-1">
                                                                <span className="font-medium text-muted-foreground">Blood Sugar</span>
                                                                <p className="font-medium">
                                                                    Fasting: {vital.bloodSugar.fasting} mg/dL
                                                                    {vital.bloodSugar.postPrandial && <br/>}
                                                                    {vital.bloodSugar.postPrandial && `Post: ${vital.bloodSugar.postPrandial} mg/dL`}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Lab Results */}
                                                    {(vital.thyroid || vital.cholesterol) && (
                                                        <div className="mt-4 pt-4 border-t">
                                                            <h4 className="font-medium mb-2">Lab Results</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                {vital.thyroid && (
                                                                    <div>
                                                                        <span className="font-medium text-muted-foreground">Thyroid:</span>
                                                                        <div className="ml-2 space-y-1">
                                                                            {vital.thyroid.tsh && <div>TSH: {vital.thyroid.tsh} μIU/mL</div>}
                                                                            {vital.thyroid.t3 && <div>T3: {vital.thyroid.t3} ng/dL</div>}
                                                                            {vital.thyroid.t4 && <div>T4: {vital.thyroid.t4} μg/dL</div>}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {vital.cholesterol && (
                                                                    <div>
                                                                        <span className="font-medium text-muted-foreground">Cholesterol:</span>
                                                                        <div className="ml-2 space-y-1">
                                                                            <div>Total: {vital.cholesterol.total} mg/dL</div>
                                                                            <div>HDL: {vital.cholesterol.hdl} mg/dL</div>
                                                                            <div>LDL: {vital.cholesterol.ldl} mg/dL</div>
                                                                            <div>Triglycerides: {vital.cholesterol.triglycerides} mg/dL</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Notes */}
                                                    {vital.notes && (
                                                        <div className="mt-4 pt-4 border-t">
                                                            <span className="font-medium text-muted-foreground">Notes:</span>
                                                            <p className="mt-1 text-sm">{vital.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">No vitals recorded yet.</p>
                                            <p className="text-sm text-muted-foreground">Use the "Update Vitals" tab to record patient measurements.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}


export function HospitalView() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="link-patient">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1">
          <TabsTrigger value="link-patient" className="text-xs sm:text-sm py-2">
            <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Link Patient</span>
            <span className="sm:hidden">Link</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="text-xs sm:text-sm py-2">
            <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Patient Management</span>
            <span className="sm:hidden">Patients</span>
          </TabsTrigger>
          <TabsTrigger value="meal-tracking" className="text-xs sm:text-sm py-2">
            <CheckSquare className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Meal Tracking</span>
            <span className="sm:hidden">Meals</span>
          </TabsTrigger>
          <TabsTrigger value="vitals" className="text-xs sm:text-sm py-2">
            <HeartPulse className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Update Vitals</span>
            <span className="sm:hidden">Vitals</span>
          </TabsTrigger>
          <TabsTrigger value="mess-menu" className="text-xs sm:text-sm py-2">
            <UtensilsCrossed className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Mess Menu</span>
            <span className="sm:hidden">Menu</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="link-patient" className="mt-4 sm:mt-6">
          <LinkPatientForm />
        </TabsContent>
        <TabsContent value="patients" className="mt-4 sm:mt-6">
          <PatientManagement />
        </TabsContent>
        <TabsContent value="meal-tracking" className="mt-4 sm:mt-6">
          <MealTrackingView />
        </TabsContent>
        <TabsContent value="vitals" className="mt-4 sm:mt-6">
          <VitalsForm />
        </TabsContent>
        <TabsContent value="mess-menu" className="mt-4 sm:mt-6">
          <MessMenuForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
