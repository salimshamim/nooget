import mysql from 'mysql2/promise';
import { decryptPassword } from './encryption.server';

type ConnectionParams = {
    databaseType: 'mysql' | 'postgresql';
    hostname: string;
    port: number;
    user: string;
    database: string;
    encryptedPass: string;
}

export const checkConnectionAuthentication = async (host: string, user: string, password: string): Promise<boolean> => {
    try {
        console.log("Checking connection authentication for host: ", host);
        if (!host) {
            console.error("Host is not defined");
            return false;
        }
        const connection = await mysql.createConnection({
            host: host,
            user: user,
            password: password,
            connectTimeout: 5000
        });
        await connection.end();
        return true;
    } catch (error) {
        console.error("Error checking connection authentication:", error);
        return false;
    }
}


export const checkIfTableExists = async (params: ConnectionParams, tableName: string): Promise<boolean> => {
    try {
        console.log("Checking if table exists: ", { params, tableName });
        if (!params || !params.hostname || !params.user || !params.database) {
            console.error("Invalid connection parameters: ", params);
            return false;
        }
        if (params.databaseType === 'mysql') {
            const connection = await getExternalDatabaseConnection(params);
            if (!connection) {
                throw new Error("Failed to establish a database connection.");
            }
            const query = `SELECT 1 FROM \`${tableName}\` LIMIT 0;`;
            try {
                await connection.query(query).finally(() => {
                    connection.end();
                });
                return true;
            } catch (error) {
                if (error instanceof Error && 'code' in error && error.code === 'ER_NO_SUCH_TABLE') {
                    return false;
                }
                throw error;
            }
        }
        return false;
    } catch (error) {
        console.error("Error checking if table exists: ", { error, params, tableName });
        return false;
    }
};


export const checkServerReachablity = async (host: string) => {
    console.log("Checking server reachability for host: ", host);
    if (!host) {
        console.error("Host is not defined");
        return false;
    }
    let conn = null;
    try {
        conn = await mysql.createConnection({
            host: host,
            port: 3306,
            connectTimeout: 3000,
            user: 'connectivitytest',
            password: 'test'
        });
    } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED')) {
            console.error("connection refused: ", { error });
            return false;
        }
        else {
            console.error("Error checking server reachability: ", { error });
            return false;
        }
    } finally {
        if (conn && 'end' in conn) {
            await conn.end();
        }
    }
    console.log("Server is reachable");
    return true;
}


const getExternalDatabaseConnection = async (params: ConnectionParams) => {
    try {
        console.log("Getting external database connection: ", { params });

        if (params.databaseType === 'mysql') {
            const connection = await mysql.createConnection({
                host: params.hostname,
                port: params.port,
                user: params.user, // Replace with actual username
                password: decryptPassword(params.encryptedPass),
                database: params.database // Replace with actual database name
            });
            return connection;
        }
    }
    catch (error) {
        console.error("Error getting connection from external db: ", { error });
        return null;
    }
}


export const runExternalDatabaseQuery = async (params: ConnectionParams, query: string, queryParams: string[]) => {
    try {
        if (params.databaseType === 'mysql') {
            const connection = await getExternalDatabaseConnection(params);
            if (!connection) {
                throw new Error("Failed to establish a database connection.");
            }
            const [rows] = await connection.query(query, queryParams).finally(() => {
                connection.end();
            });
            return rows;
        }
    }
    catch (error) {
        console.error("Error executing externam database query: ", { error, params, query, queryParams });
        return [];
    }
}

