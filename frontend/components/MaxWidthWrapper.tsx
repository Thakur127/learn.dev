import { cn } from "@/lib/utils";

const MaxWidthWrapper = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("max-w-7xl container p-4 md:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
};
export default MaxWidthWrapper;
