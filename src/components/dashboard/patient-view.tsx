import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DietChart } from "./diet-chart";
import { PersonalChatbot } from "./personal-chatbot";
import { FileText, Bot } from "lucide-react";

export function PatientView() {
  return (
    <Tabs defaultValue="diet-plan">
      <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
        <TabsTrigger value="diet-plan">
            <FileText className="mr-2 h-4 w-4" />
            My Diet Plan
        </TabsTrigger>
        <TabsTrigger value="chatbot">
            <Bot className="mr-2 h-4 w-4" />
            Personal Chatbot
        </TabsTrigger>
      </TabsList>
      <TabsContent value="diet-plan">
        <DietChart />
      </TabsContent>
      <TabsContent value="chatbot">
        <PersonalChatbot />
      </TabsContent>
    </Tabs>
  );
}
