import TopHeader from "@/components/ui/top-header";
import { currentUser } from "@/lib/auth";

export default async function Layout({ params, children }: { params: { username: string }, children: React.ReactNode }) {
    const { username } = await params;
    const user = await currentUser();

    return <div className="flex flex-col w-full h-screen ">
        <TopHeader title={user?.role === 'ADMIN' ? `ADMIN CONSOLE  /  ${username}'s View` : `Welcome ${user?.username === username ? username : ''}`} showLogout={true} />
        {children}
    </div>
}