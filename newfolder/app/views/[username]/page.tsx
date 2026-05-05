import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import View from "@/components/ui/view/view";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Page({ params }: { params: { username: string } }) {
    const { username } = await params;
    const user = await currentUser();
    const viewNames = await db.user.findUnique({
        where: {
            username: username
        },
        select: {
            cdrView: true,
            activityView: true
        }
    })

    if (!user || (user.role !== "ADMIN" && user.username !== username)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">Unauthorized</h1>
                <p className="mt-4 text-gray-600">You do not have permission to view this page.</p>
            </div>
        );
    }


    return (
        <div className="flex flex-col h-full">
            <Tabs defaultValue="activity" className=" flex w-full h-full">
                <TabsList className="bg-gray-200 w-full">
                    <TabsTrigger disabled={!!!viewNames?.activityView} value="activity" className="w-full cursor-pointer">
                        <h1 className="text-2xl font-bold">Activity Data</h1>
                    </TabsTrigger>
                    <TabsTrigger disabled={!!!viewNames?.cdrView} value="cdr" className="w-full cursor-pointer">
                        <h1 className="text-2xl font-bold">CDR Data</h1>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="flex flex-col w-full h-full">
                    <View username={username} viewType="activity" />
                </TabsContent>
                <TabsContent value="cdr" className="flex flex-col w-full h-full">
                    <View username={username} viewType="cdr" />
                </TabsContent>
            </Tabs>
        </div>
    );
}