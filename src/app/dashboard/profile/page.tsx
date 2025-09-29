import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <p>User profile information will be displayed here.</p>
            </CardContent>
        </Card>
    );
}
