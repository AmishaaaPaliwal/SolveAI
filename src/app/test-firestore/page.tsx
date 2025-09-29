import { TestFirestore } from "@/components/test-firestore";

export default function TestFirestorePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Firebase Firestore Integration Test</h1>
        <p className="text-muted-foreground">
          Test your Firebase Firestore connection and CRUD operations.
        </p>
      </div>
      <TestFirestore />
    </div>
  );
}