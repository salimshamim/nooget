"use client";

import { LoginSchema, LoginSchemaType } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { login } from "@/actions/login";
import { Input } from "../input";
import { Button } from "../button";
import FormError from "../form-error";
import FormSuccess from "../form-success";
import CardWrapper from "./card-wrapper";
import { Checkbox } from "../checkbox";
import { DotLoader } from "react-spinners";


function LoginForm() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [success, setSuccess] = useState<string | null>();
    const [error, setError] = useState<string | null>();
    const [pending, startTransition] = useTransition();
    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    });
    const onSubmit = async (values: LoginSchemaType) => {
        console.log("Handle submit", { values });
        setError(null);
        setSuccess(null);
        startTransition(async () => {
            login(values).then((data) => {
                if (data?.success) {
                    setSuccess(data?.success);
                }
                else {
                    setError(data?.error || "Something went wrong");
                }
            })
        })
    }
    interface OnSubmitFailureErrors {
        [key: string]: unknown;
    }

    const onSubmitFailure = (errors: OnSubmitFailureErrors): void => {
        console.error("Cannot submit due to errors: ", errors);
    }
    return (
        <CardWrapper
            pending={pending}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onSubmitFailure)}>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={pending} placeholder="john_doe" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={pending} placeholder="******" type={passwordVisible === true ? 'text' : 'password'} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center space-x-2">
                            <Checkbox disabled={pending} id="terms" onClick={() => setPasswordVisible(!passwordVisible)} />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Show password
                            </label>
                        </div>
                        <FormError message={error} />
                        <FormSuccess message={success} />

                    </div>
                    <Button disabled={pending} type="submit" className="mt-6 cursor-pointer w-full">
                        {
                            pending ?
                                <DotLoader
                                    color="white" size={20} /> :
                                'Login'
                        }
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
}

export default LoginForm;