import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockDietChart } from "@/lib/data";
import { Utensils, Printer, Sun, Coffee, Sunset, Soup } from 'lucide-react';
import type { Meal } from "@/lib/types";

const getMealIcon = (mealName: string) => {
  if (mealName.toLowerCase().includes('breakfast')) return <Coffee className="h-5 w-5 text-accent" />;
  if (mealName.toLowerCase().includes('lunch')) return <Sun className="h-5 w-5 text-accent" />;
  if (mealName.toLowerCase().includes('dinner')) return <Sunset className="h-5 w-5 text-accent" />;
  return <Soup className="h-5 w-5 text-accent" />;
};

export function DietChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="h-6 w-6" />
          <CardTitle className="font-headline">Your Weekly Diet Plan</CardTitle>
        </div>
        <Button variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Print / Export
        </Button>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-0">
          {mockDietChart.map((day, index) => (
            <AccordionItem value={`item-${index}`} key={day.day}>
              <AccordionTrigger className="text-lg font-semibold font-headline">{day.day}</AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meal</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {day.meals.map((meal: Meal) => (
                      <TableRow key={meal.name}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {getMealIcon(meal.name)}
                          {meal.name}
                        </TableCell>
                        <TableCell>{meal.time}</TableCell>
                        <TableCell>{meal.items.join(', ')}</TableCell>
                        <TableCell className="text-muted-foreground">{meal.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
