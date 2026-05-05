import { User } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { decryptPassword } from "@/lib/encryption.server";
import mysql from "mysql2/promise";


type InputProps = {
    viewUser: User;
    dataType: 'cdr' | 'activity';
    startDate: Date;
    endDate: Date;
}

export const getViewData = async ({ viewUser, dataType, startDate, endDate }: InputProps) => {
    try {
        const user = await currentUser();
        if (user?.role !== "ADMIN" && user?.username !== viewUser.username) {
            throw new Error("Unauthorized");
        }
        const dbHost = viewUser?.host;
        const dbPort = viewUser?.dbPort;
        const dbName = viewUser?.dbName;
        const dbUser = viewUser?.dbUser;
        const dbCdrView = viewUser?.cdrView;
        const dbActivityView = viewUser?.activityView;
        if ((dbCdrView && dataType === 'cdr') || (dbActivityView && dataType === 'activity')) {
            throw new Error("Database view details are missing for user: " + viewUser);
        }
        const dbPassword = viewUser?.dbPass;
        if (!dbHost || !dbPort || !dbName || !dbUser || !dbPassword) {
            throw new Error("Database connection details are missing for user: " + viewUser);
        }
        console.log("Database connection details retrieved successfully: ", {
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: decryptPassword(dbPassword),
            database: dbName,
        });
        const conn = await mysql.createConnection(
            {
                host: dbHost,
                port: dbPort,
                user: dbUser,
                password: decryptPassword(dbPassword),
                database: dbName,
            }
        );

        // Check if the connection is successfu
        await conn.connect();
        console.log("Connected to the database successfully");


        const query = dataType === 'activity' ?
            "select * from `" + dbActivityView + "` where timestamp >= ? and timestamp <= ?" :
            "select * from `" + dbCdrView + "` where timestamp >= ? and timestamp <= ?";
        let queryResult: mysql.RowDataPacket[] = [];
        try {
            console.log("Executing query:", query, "with parameters:", startDate, endDate);
            [queryResult] = await conn.execute(query, [startDate, endDate]) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
            console.log("Query executed successfully. Rows fetched:", queryResult.length);
        } finally {
            await conn.end();
            console.log("Database connection closed.");
        }


        return queryResult.map((row) => {
            const newRow: { [key: string]: unknown } = {};
            for (const key in row) {
                if (row.hasOwnProperty(key)) {
                    newRow[key] = row[key];
                }
            }
            return newRow;
        });
    }
    catch (e) {
        throw e;
    }
}