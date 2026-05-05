import { db } from "../lib/db";
import { hashPassword } from "../lib/encryption.server";

async function main() {
    const plaintextAdminPassword = "admin";
    const hashedAdminPassword = await hashPassword(plaintextAdminPassword);

    const adminUser = await db.user.upsert({
        where: { username: "superadmin_3clogic" },
        update: {},
        create: {
            name: "Super Admin",
            username: "superadmin_3clogic",
            email: "superadmin@3clogic.com",
            password: hashedAdminPassword,
            emailVerified: new Date(),
            role: 'ADMIN',
        },
    });

    console.log("Admin user upserted:", adminUser);

    const plaintextNormalPassword = "testuser";
    const hashedNormalPassword = await hashPassword(plaintextNormalPassword);

    const normalUser = await db.user.upsert({
        where: { username: "testuser_3clogic" },
        update: {},
        create: {
            name: "testuser",
            username: "testuser_3clogic",
            email: "testuser@3clogic.com",
            password: hashedNormalPassword,
            emailVerified: new Date(),
            role: 'CUSTOMER',
        },
    });

    console.log("Normal user upserted:", normalUser);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });