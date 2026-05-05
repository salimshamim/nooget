import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getViewData } from "@/data/data-export.server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, dataType, startDate, endDate } = body;
        let parsedStartDate: Date;
        let parsedEndDate: Date;
        try {
            parsedStartDate = new Date(startDate);
            parsedEndDate = new Date(endDate);
            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
            }
            if (parsedStartDate > parsedEndDate) {
                return NextResponse.json({ error: "Start date cannot be after end date" }, { status: 400 });
            }
        } catch (error) {
            console.error("Date parsing error:", error);
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const user = await currentUser();
        if (user?.role !== "ADMIN" && user?.username !== username) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const viewUser = await db.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!viewUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const dbCdrView = viewUser?.cdrView;
        const dbActivityView = viewUser?.activityView;
        if ((dbCdrView && dataType === 'cdr') || (dbActivityView && dataType === 'activity')) {
            return NextResponse.json({ error: "Database view details are missing for user: " + username }, { status: 404 });
        }

        const rows = await getViewData({
            viewUser,
            dataType,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
        });

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: "No data found" }, { status: 404 });
        }

        // Convert rows to CSV (assume uniform keys)
        const headers = Object.keys(rows[0]);
        const csvRows = [headers.join(",")];
        for (const row of rows) {
            const values = headers.map((header) => JSON.stringify(row[header] ?? ""));
            csvRows.push(values.join(","));
        }
        const csvString = csvRows.join("\n");
        console.log("CSV String: ", csvString);
        return new NextResponse(csvString, {
            status: 200, headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=${username}-${dataType}-export-${new Date().toISOString()}.csv`,
            }
        });
    } catch (error) {
        console.error("Data Export error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}