import { cn } from "../../lib/utils";

export default function Button({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={ cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5",
        "bg-black text-white font-medium shadow-sm transition",
        "hover:scale-[1.01] hover:shadow-md active:scale-[0.99]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}
