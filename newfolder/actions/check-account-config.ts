"use server"

import { getUserByUsername } from "@/data/user.server";
import { currentUser } from "@/lib/auth";
import { encryptPassword } from "@/lib/encryption.server";
import { checkServerReachablity, checkConnectionAuthentication, checkIfTableExists } from "@/lib/external-db.server";
import { AccountSchemaType } from "@/schema/AccountSchema"

type ResponseType = {
    error?: string;
    message?: string;
    usernameValid?: boolean;
    usernameMessage?: string;
    hostReachable?: boolean;
    hostMessage?: string;
    credentialsGood?: boolean;
    credentialsMessage?: string;
    cdrViewExists?: boolean;
    cdrViewMessage?: string;
    activityViewExists?: boolean;
    activityViewMessage?: string;
}



export const checkAccountConfig = async (values: AccountSchemaType) => {
    const user = await currentUser();
    if (user?.role !== 'ADMIN') {
        return {
            error: "Unauthorized"
        }
    }


    const response: ResponseType = {
        error: undefined,
        message: undefined,
        usernameValid: true,
        hostReachable: true,
        credentialsGood: true
    }

    const { host, username, dbName, dbUser, dbPass, cdrView, activityView } = values;
    if (!username) {
        response.usernameValid = false;
        response.usernameMessage = "Username is required";
        return response;
    }
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        console.log("User exists: ", username);
        response.usernameValid = false;
        response.usernameMessage = "Username already exists";
    }
    if (host) {
        const dbReachable = await checkServerReachablity(host);

        response.hostReachable = dbReachable;
        response.hostMessage = dbReachable ? undefined : "Database host is not reachable";

        if (!dbReachable) {
            return response;
        }

        const authenticated = await checkConnectionAuthentication(host, dbUser, dbPass || '');
        response.credentialsGood = authenticated;
        response.credentialsMessage = authenticated ? undefined : "Database credentials are not valid";

        if (!authenticated) {
            return response;
        }

        const cdrViewExists = cdrView ? await checkIfTableExists({
            databaseType: 'mysql',
            hostname: host,
            port: 3306,
            user: dbUser,
            database: dbName,
            encryptedPass: dbPass ? encryptPassword(dbPass) : ''
        }, cdrView) : false;

        response.cdrViewExists = cdrViewExists;
        response.cdrViewMessage = cdrViewExists ? undefined : "CDR view does not exist";

        if (!cdrViewExists) {
            return response;
        }

        const activityViewExists = activityView ? await checkIfTableExists({
            databaseType: 'mysql',
            hostname: host,
            port: 3306,
            user: dbUser,
            database: dbName,
            encryptedPass: dbPass || ''
        }, activityView) : false;

        response.activityViewExists = activityViewExists;
        response.activityViewMessage = activityViewExists ? undefined : "Activity view does not exist";

        if (!activityViewExists) {
            return response;
        }
    }
    return response;
}
