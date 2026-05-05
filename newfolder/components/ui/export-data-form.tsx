"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { DateRangePicker } from "./date-range-picker"
import { Form, FormControl, FormField, FormItem, FormLabel } from "./form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./select"
import FormError from "./form-error"
import FormSuccess from "./form-success"
import { Button } from "./button"
import FormWarn from "./form-warn"

interface FormValues {
    dateRange: DateRange | undefined,
    dataType: 'cdr' | 'activity'
}

export function ExportDataForm({ formId, username, pending, setPending, dataType }: { dataType?: 'cdr' | 'activity', formId?: string, username: string, pending: boolean, setPending: (pending: boolean) => void }) {
    const [error, setError] = React.useState<string | null>(null);
    const [warn, setWarn] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    const form = useForm<FormValues>({
        defaultValues: {
            dateRange: {
                from: subDays(new Date(), 7),
                to: new Date(),
            },
        },
    })

    const onSubmit = async (data: FormValues) => {
        setError(null);
        setSuccess(null);
        setWarn(null);
        setPending(true);
        const response = await fetch('/api/data-export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                dataType: dataType ?? data.dataType,
                startDate: data.dateRange?.from,
                endDate: data.dateRange?.to,
            })
        }).finally(() => {
            setPending(false);
        });
        console.log("Response: ", response);

        if (!response.ok) {
            if (response.status === 404) {
                const body = await response.json();
                console.log("Export Response body : ", { body });
                if (body?.error) {
                    setError(body?.error || 'Something went wrong')
                }
                else {
                    setWarn("No Data for the selected window");
                }
            }
            else {
                console.error("Failed to export data:", response.statusText);
                setError("Failed to export data. Please try again.");
            }
            setSuccess(null);
            return;
        }
        else {
            setSuccess("Data exported successfully. Check your downloads.");
            setError(null);
        }

        const blob = await response.blob();
        console.log("Blob: ", blob);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        console.log("Url: ", url);
        a.download = `exported_data_${data.dataType}_${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }

    const onSubmitError = () => {
        console.error("Form submission error");
    }

    return (
        <Form {...form}>
            <form id={formId ?? ''} onSubmit={form.handleSubmit(onSubmit, onSubmitError)} className="flex flex-col w-full items-center space-y-6">
                <FormField
                    name="dateRange"
                    disabled={pending}
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select Date Range</FormLabel>
                            <FormControl>
                                <DateRangePicker date={field.value} setDate={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {
                    !dataType &&
                    <FormField
                        name="dataType"
                        control={form.control}
                        disabled={pending}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select Data Type</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Data Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Fruits</SelectLabel>
                                                <SelectItem value="cdr">CDR Data</SelectItem>
                                                <SelectItem value="activity">Activity Data</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                }
            </form>
            <FormError message={error} />
            <FormWarn message={warn} />
            <FormSuccess message={success} />
            {pending && <div className="flex items-center justify-center">
                <span className="text-sm text-gray-500">Exporting data...</span>
            </div>}
            {
                !formId &&
                <Button type="submit">
                    Download
                </Button>
            }
        </Form>
    )
}

/**
 * <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full p-2">
      <div className="flex flex-col space-y-1">
        <Label>Select Date Range</Label>
        <Controller
          name="dateRange"
          control={control}
          render={({ field }) => (
            <DateRangePicker date={field.value} setDate={field.onChange} />
          )}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
 */