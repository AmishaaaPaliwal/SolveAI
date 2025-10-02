"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { seedData } from "@/lib/firestore";
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsLoading(true);

    try {
      console.log('Starting data seeding process...');

      await seedData.seedAll();

      console.log('Data seeding completed successfully');

      setIsSeeded(true);

      toast({
        title: "Seeding Successful!",
        description: "Sample data has been added to Firestore. Check Firebase Console to see the users and hospitals collections.",
      });

    } catch (error) {
      console.error('Seeding error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: "Seeding Failed",
        description: `Error: ${errorMessage}. Please check console for details.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSeeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-headline">Data Seeded Successfully!</CardTitle>
            <CardDescription>
              Sample users and hospitals have been added to your Firestore database.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">What was seeded:</p>
              <ul className="text-sm text-left space-y-1">
                <li>• 2 Sample Hospitals</li>
                <li>• 4 Sample Users (admins, dietitians, patients)</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Check your Firebase Console to see the new collections and documents.
            </p>
            <Button onClick={() => setIsSeeded(false)} variant="outline" className="w-full">
              Seed Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Database className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl font-headline">Database Seeding</CardTitle>
          <CardDescription>
            Populate Firestore with sample data for development and testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">This will create:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 2 Sample Hospitals</li>
              <li>• 4 Sample Users (hospital admins, dietitians, patients)</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-amber-800">Development Only</p>
                <p className="text-sm text-amber-700">
                  This page should only be used during development. Remove or protect it in production.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSeedData}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed Sample Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}