"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateInitialDietChart } from "@/ai/flows/generate-initial-diet-chart";
import { User, Bot, Loader2 } from "lucide-react";
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
import type { Patient } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

const formSchema = z.object({
  userProfile: z.string().min(10, "Please provide more details."),
  vitals: z.string().min(10, "Please provide more details."),
  messMenu: z.string().min(10, "Please provide more details."),
  ayurvedicPrinciples: z.string().min(10, "Please provide more details."),
});

function DietGenerationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedChart, setGeneratedChart] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userProfile: "Female, 29 years old, Vegetarian, Sedentary lifestyle.",
      vitals: "Height: 5'4\", Weight: 140 lbs, BP: 120/80.",
      messMenu: "Morning: Poha, Upma, Tea. Lunch: Roti, Rice, Dal, Mixed Veg. Dinner: Khichdi, Veg Soup.",
      ayurvedicPrinciples: "Focus on Pitta-pacifying diet. Avoid spicy and oily foods. Include cooling herbs.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedChart("");
    try {
      const result = await generateInitialDietChart(values);
      setGeneratedChart(result.dietChart);
    } catch (error) {
      console.error(error);
      setGeneratedChart("Failed to generate diet chart. Please try again.");
    }
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><Bot /> AI Diet Chart Generation</CardTitle>
        <CardDescription>
          Fill in the patient's details to generate a personalized Ayurvedic diet plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="userProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Profile</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Age, gender, dietary habits..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vitals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vitals</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Height, weight, BP..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="messMenu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Mess Menu</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List available foods..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ayurvedicPrinciples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ayurvedic Principles to Apply</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Pitta-pacifying, avoid spicy..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Plan
            </Button>
          </form>
        </Form>
        {generatedChart && (
          <div className="mt-6">
            <Label className="text-lg font-headline">Generated Diet Chart</Label>
            <Card className="mt-2 bg-secondary/50">
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap font-body text-sm">{generatedChart}</pre>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PatientManagement() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "patients"));
                const patientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
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


export function DietitianView() {
  return (
    <Tabs defaultValue="patients">
      <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
        <TabsTrigger value="patients">
          <User className="mr-2 h-4 w-4" />
          Patients
        </TabsTrigger>
        <TabsTrigger value="generate-plan">
          <Bot className="mr-2 h-4 w-4" />
          Generate Plan
        </TabsTrigger>
      </TabsList>
      <TabsContent value="patients">
        <PatientManagement />
      </TabsContent>
      <TabsContent value="generate-plan">
        <DietGenerationForm />
      </TabsContent>
    </Tabs>
  );
}
