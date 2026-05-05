"use client";

import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
    ModuleRegistry,
    ColDef,
    CellStyleModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    ClientSideRowModelModule,
    PaginationModule,
    ValidationModule,
    themeAlpine,
} from "ag-grid-community";
import { fetchCustomerAccounts } from "@/actions/get-accounts";
import { HashLoader } from "react-spinners";
import { AccountActionMenu } from "./account-action-menu";
import { deleteCustomerAccount } from "@/actions/delete-account";
import { User } from "@prisma/client";
import { AccountSchemaType } from "@/schema/AccountSchema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "../dialog";
import { Button } from "../button";


// Register the required modules
ModuleRegistry.registerModules([CellStyleModule, PaginationModule, ClientSideRowModelModule, ValidationModule, TextFilterModule, NumberFilterModule, DateFilterModule]);

export default function CustomerAccountGrid() {
    const [rowData, setRowData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAccountToDelete, selectAccountToDelete] = useState<string | null>(null);

    const deleteAction = async (username: string) => {
        try {
            console.log("Delete action ::: ", { username });
            selectAccountToDelete(username);
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };


    const handleDelete = async () => {
        try {
            console.log("Deleting : ", { selectAccountToDelete })
            if (selectedAccountToDelete) {
                setLoading(true);

                console.log("Set row data done");
                await deleteCustomerAccount(selectedAccountToDelete).finally(() => {
                    setLoading(false);
                });
                setRowData((prev) => prev.filter((account) => account.username !== selectedAccountToDelete));
                selectAccountToDelete(null);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    }



    const columnDefs: ColDef[] = [
        { headerName: "S.No", valueGetter: "node.rowIndex + 1", maxWidth: 70 },
        { field: "username", headerName: "Username", sortable: true, filter: true },
        { field: "host", headerName: "Host", sortable: true, filter: true, minWidth: 350 },
        { field: "dbName", headerName: "Database", sortable: true, filter: true },
        { field: "dbPort", headerName: "Port", sortable: true, filter: true },
        { field: "cdrView", headerName: "CDR View", sortable: true, filter: true },
        { field: "activityView", headerName: "Activity View", sortable: true, filter: true },
        {
            field: "Actions", maxWidth: 150, headerName: "Actions", cellRenderer: (params: { data: AccountSchemaType }) => (
                <AccountActionMenu data={params.data} selectAccountDelete={deleteAction} />
            )
        }
    ];
    const defaultColDef = {
        flex: 1,
        minWidth: 100,
        floatingFilter: true,
        cellStyle: { textAlign: "center", transform: "translateX(-10px)" }
    };


    useEffect(() => {
        async function getData() {
            try {
                setLoading(true);
                const data = await fetchCustomerAccounts().finally(() => setLoading(false));
                console.log("Data: ", { data });
                if (data?.accounts) {
                    setRowData(data.accounts.map(account => ({
                        username: account.username,
                        host: `${account.host} | PORT: ${account.dbPort}`,
                        dbUser: account.dbUser,
                        dbName: account.dbName, 
                        cdrView: account.cdrView,
                        activityView: account.activityView

                    })) as User[]);
                    setLoading(false);
                } else {
                    console.error("No data received from fetchCustomerAccounts");
                }
            } catch (err) {
                console.error("Error fetching customer accounts:", err);
            }
        }
        getData();
    }, []);

    return (
        <>
            {
                loading === false ?
                    <div className="w-full h-full">
                        <h5 className="text-3xl my-2 font-bold">All Accounts</h5>
                        <AgGridReact
                            theme={themeAlpine}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            pagination={true}
                            paginationPageSize={10}
                        />
                    </div >
                    :
                    <div className="flex h-full w-full items-center justify-center"><HashLoader size={50} /></div>
            }
            <Dialog
                open={!!selectedAccountToDelete}
                onOpenChange={(open) => { if (!open) selectAccountToDelete(null); }}
            >
                <DialogContent>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {selectedAccountToDelete}&#39;s account? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button className="cursor-pointer" variant="secondary" onClick={() => selectAccountToDelete(null)}>
                            Cancel
                        </Button>
                        <Button className="cursor-pointer" variant="destructive" onClick={() => handleDelete()}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    );
}