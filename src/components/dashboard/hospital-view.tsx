"use client";

import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, UtensilsCrossed, Link2 } from "lucide-react";
import { Label } from "../ui/label";


function LinkPatientForm() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const code = (e.currentTarget.elements.namedItem('patientCode') as HTMLInputElement).value;
        toast({
            title: "Patient Linked",
            description: `Patient with code ${code} has been successfully linked.`,
        });
        e.currentTarget.reset();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Link2 /> Link Patient Profile</CardTitle>
                <CardDescription>
                    Enter the patient's unique code to sync their profile with the hospital system.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="flex items-center gap-2" onSubmit={handleSubmit}>
                    <Input id="patientCode" name="patientCode" placeholder="Enter Patient Code (e.g., AS823P)" required />
                    <Button type="submit">Link Patient</Button>
                </form>
            </CardContent>
        </Card>
    );
}

function MessMenuForm() {
    const { toast } = useToast();
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: "Menu Updated",
            description: "The mess menu has been successfully updated.",
        });
        (e.currentTarget.elements.namedItem('menuItems') as HTMLTextAreaElement).value = '';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><UtensilsCrossed /> Update Mess Menu</CardTitle>
                <CardDescription>
                    Quickly add or update today's menu items. Tag items with nutritional and Ayurvedic properties.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="menuItems">Today's Menu Items</Label>
                        <Textarea id="menuItems" name="menuItems" placeholder="e.g., Poha (Light, Vata-pacifying), Moong Dal (Protein-rich, Tridoshic), Roti..." className="mt-2" rows={6} required />
                    </div>
                    <Button type="submit">Update Menu</Button>
                </form>
            </CardContent>
        </Card>
    );
}


export function HospitalView() {
  return (
    <Tabs defaultValue="link-patient">
      <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
        <TabsTrigger value="link-patient">
          <User className="mr-2 h-4 w-4" />
          Link Patient
        </TabsTrigger>
        <TabsTrigger value="mess-menu">
          <UtensilsCrossed className="mr-2 h-4 w-4" />
          Mess Menu
        </TabsTrigger>
      </TabsList>
      <TabsContent value="link-patient">
        <LinkPatientForm />
      </TabsContent>
      <TabsContent value="mess-menu">
        <MessMenuForm />
      </TabsContent>
    </Tabs>
  );
}
