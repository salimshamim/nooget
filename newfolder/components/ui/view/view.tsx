"use client";

import { useState } from "react";
import { ExportDataForm } from "../export-data-form";
import { Card, CardAction, CardTitle } from "../card";
import { Button } from "../button";

export default function View({ username, viewType }: { username: string, viewType: 'cdr' | 'activity' }) {
    const [pending, setPending] = useState(false);

    return <div className="flex w-full h-full justify-center">
        <Card className="p-2 flex flex-col w-xl h-fit">
            <CardTitle>Export {viewType} Data</CardTitle>
            <ExportDataForm formId="export-data" pending={pending} setPending={setPending} username={username} dataType={viewType} />
            <CardAction className="w-full ml-auto">
                <Button className="cursor-pointer w-full" form="export-data" type="submit">Download</Button>
            </CardAction>
        </Card>
    </div>
}