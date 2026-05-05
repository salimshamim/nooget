import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const getAllAccountsUpdatedDesc = async () => {
    try {
        const accounts = await db.user.findMany({
            select: {
                id: true,
                username: true,
                host: true,
                dbUser: true,
                dbName: true,
                dbPort: true,
                cdrView: true,
                activityView: true,
                createdAt: true,
                updatedAt: true,
            },
            where: {
                role: UserRole.CUSTOMER
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        console.log("Account Returning: ", { accounts });
        return accounts;
    }
    catch (error) {
        console.error("Error #getAllAccountsUpdatedDesc ", { error });
        return [];
    }
}