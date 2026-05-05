import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
interface FormErrorProps {
  message: string | null | undefined;
}

function FormWarn({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className="bg-amber-300/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-amber-700">
      <ExclamationTriangleIcon />
      {message}
    </div>
  );
}

export default FormWarn;
