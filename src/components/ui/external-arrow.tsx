import { ArrowUpRight } from "lucide-react";

export function ExternalArrow() {
  return (
    <span
      className="font-normal text-muted-foreground print:hidden"
      aria-hidden="true"
    >
      <ArrowUpRight
        className="ml-1 inline size-3 align-baseline"
        strokeWidth={1.5}
      />
    </span>
  );
}
