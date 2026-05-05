"use client";

import { AccountSchema, AccountSchemaType } from "@/schema/AccountSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../input";
import { useState } from "react";
import { Button } from "../button";
import { BadgeCheck, Eye, EyeOff, Zap } from "lucide-react";
import { createCustomerAccount } from "@/actions/create-account";
import FormError from "../form-error";
import FormSuccess from "../form-success";
// import { checkValidUsername } from "@/actions/username-check";
import { updateCustomerAccount } from "@/actions/update-account";
import { checkAccountConfig } from "@/actions/check-account-config";

export const AccountForm = ({
    formId,
    pending,
    setPending,
    exisingData
}: {
    formId: string,
    pending: boolean,
    setPending: (pending: boolean) => void,
    exisingData?: AccountSchemaType
}) => {
    console.log("Existing data in AccountForm ", exisingData);
    const [checking, setChecking] = useState(false);
    const [accountPasswordVisible, setAccountPasswordVisible] = useState(false);
    const [usernameValid, setUsernameValid] = useState<boolean | undefined>(undefined);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState<string>();
    const [success, setSuccess] = useState<string>();
    const form = useForm<AccountSchemaType>({
        resolver: zodResolver(AccountSchema),
        defaultValues: {
            dbUser: exisingData?.dbUser ?? '',
            dbPass: undefined,
            host: exisingData?.host ?? '',
            username: exisingData?.username ?? '',
            password: undefined,
            cdrView: exisingData?.cdrView ?? '',
            role: exisingData?.role ?? 'CUSTOMER',
            activityView: exisingData?.activityView ?? '',
            dbName: exisingData?.dbName ?? '',
            dbPort: exisingData?.dbPort ?? 3306,
        },
        mode: "onBlur"
    });

    const onSubmit = async (values: AccountSchemaType) => {
        setPending(true);
        if (exisingData && exisingData.username) {
            console.log("Updating Account : ", form.getValues());
            updateCustomerAccount(form.getValues()).then((data) => {
                if (data?.success) {
                    setSuccess("Account updated successfully");
                }
                else {
                    setError(data?.error || "Something went wrong");
                }
                setPending(false);
            });
        }
        else {
            console.log("Creating Customer account with values : ", values);
            createCustomerAccount(values).then((data) => {
                if (data?.success) {
                    setSuccess("Account created successfully");
                    form.reset();
                }
                else {
                    setError(data?.error || "Something went wrong");
                }
                setPending(false);
            });
        }

    }

    const checkFormConfig = async () => {
        setChecking(true);
        form.clearErrors();
        setUsernameValid(undefined);
        setError(undefined);
        setSuccess(undefined);
        const result = await checkAccountConfig(form.getValues()).catch((err) => {
            console.log("Error in checking account config: ", err);
            setError(err?.message || "Something went wrong");
        }).finally(() => {
            setChecking(false);
        });
        console.log("Result of checkAccountConfig: ", result);
        if (result?.usernameValid === false) {
            form.setError('username', { message: result.usernameMessage });
            setUsernameValid(false);
        } else {
            form.clearErrors('username');
            setUsernameValid(true);
        }
        setError(result?.error);
        if (result?.hostMessage) {
            form.setError('host', { message: result.hostMessage });
        } else {
            form.clearErrors('host');
        }
        if (result?.credentialsMessage) {
            form.setError('dbUser', { message: result.credentialsMessage });
        } else {
            form.clearErrors('dbUser');
        }
        if (result?.credentialsMessage) {
            form.setError('dbPass', { message: result.credentialsMessage });
        } else {
            form.clearErrors('dbPass');
        }
        if (result?.cdrViewMessage) {
            form.setError('cdrView', { message: result.cdrViewMessage });
        } else {
            form.clearErrors('cdrView');
        }
        if (result?.activityViewMessage) {
            form.setError('activityView', { message: result.activityViewMessage });
        } else {
            form.clearErrors('activityView');
        }

    }




    // const checkUsername = async () => {
    //     const value = form.getValues()?.username;
    //     if (!exisingData?.username && value) {
    //         const result = await checkValidUsername(value);
    //         if (result.error) {
    //             form.setError('username', { message: "already exists" });
    //             setUsernameValid(false);
    //         }
    //         else {
    //             form.clearErrors('username');
    //             setUsernameValid(true);
    //         }
    //     }
    // }

    const onSubmitError = (errors: {
        errors: Record<string, unknown>;
    }["errors"]) => {
        console.log("Cannot submit ", { errors });
    };

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit, onSubmitError)} className="space-y-6">
                <div className="flex gap-x-3 px-1 ">
                    <FormField
                        name="username"
                        control={form.control}
                        disabled={pending || !!exisingData?.username}
                        render={({ field }) => (
                            <FormItem className="flex-1 mx-1">
                                <FormLabel>
                                    Username
                                </FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input {...field} value={field.value} placeholder="account's username"
                                            onBlur={() => {
                                                if (!exisingData) {
                                                    checkFormConfig();
                                                }
                                            }} />
                                    </FormControl>
                                    {
                                        !exisingData?.username && usernameValid &&
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                                            <BadgeCheck className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    }
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="w-full flex items-center">
                                        <div className="relative w-full">
                                            <Input
                                                {...field}
                                                disabled={pending}
                                                placeholder="*******"
                                                type={accountPasswordVisible ? "text" : "password"}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="cursor-pointer absolute right-8"
                                            onClick={() => setAccountPasswordVisible(!accountPasswordVisible)}
                                            disabled={pending}
                                        >
                                            {!accountPasswordVisible ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                            <span className="sr-only">
                                                {accountPasswordVisible ? "Hide password" : "Show password"}
                                            </span>
                                        </Button>

                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-x-3 px-1 ">

                    <FormField
                        name="host"
                        control={form.control}
                        disabled={pending}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>
                                    Database Host
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="my.db.address.com" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="dbPort"
                        control={form.control}
                        disabled={pending}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Port
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} type='number' placeholder="3306" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-x-3 px-1 ">
                    <FormField
                        name="dbUser"
                        control={form.control}
                        disabled={pending}
                        render={({ field }) => (
                            <FormItem className="flex-1 mx-1">
                                <FormLabel>
                                    Database Username
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="client_user" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="dbPass"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Database Password</FormLabel>
                                <FormControl>
                                    <div className="w-full flex items-center">
                                        <div className="relative w-full">
                                            <Input
                                                {...field}
                                                disabled={pending}
                                                placeholder="*******"
                                                type={passwordVisible ? "text" : "password"}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="cursor-pointer absolute right-8"
                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                            disabled={pending}
                                        >
                                            {!passwordVisible ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                            <span className="sr-only">
                                                {passwordVisible ? "Hide password" : "Show password"}
                                            </span>
                                        </Button>

                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div>
                    <FormField
                        name="dbName"
                        control={form.control}
                        disabled={pending}
                        render={({ field }) => (
                            <FormItem className="flex-1 mx-1">
                                <FormLabel>
                                    DB Name
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="client_user" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>
                <FormField
                    name="cdrView"
                    control={form.control}
                    disabled={pending}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                CDR Table/View name
                            </FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="chr_view" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="activityView"
                    control={form.control}
                    disabled={pending}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Activity Table/View name
                            </FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="activity_table" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormError message={error} />
                <FormSuccess message={success} />
            </form>
            <Button className="cursor-pointer max-w-48" variant="outline" size="sm" onClick={() => {
                checkFormConfig();
            }}>
                <Zap className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
                {
                    checking ? "Checking..." : "Check Config"
                }
            </Button>
        </Form>
    )
}