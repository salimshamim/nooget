"use client";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { X } from "lucide-react";
import { Button } from "./button";
import { useEffect, useState } from "react";

interface FormSuccessProps {
  message: string | null | undefined;
}

function FormSuccess({ message }: FormSuccessProps) {
  const [close, setClosed] = useState(false);


  useEffect(() => {
    setClosed(false);
  }, [message])

  function handleClose() {
    setClosed(true);
  }

  if (!message || message.trim() === "" || close) {
    return null;
  }

  return (
    <div className="bg-emerald-500/15 p-3 w-full rounded-md flex items-center gap-x-2 text-sm font-semibold text-emerald-700">
      <CheckCircledIcon />
      {message}
      <Button className="ml-auto" variant="ghost" onClick={handleClose} >
        <X />
      </Button>
    </div>
  );
}

export default FormSuccess;