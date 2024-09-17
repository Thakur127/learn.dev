"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/types/challenges";

interface MultiSelectComboboxProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  values: Topic[];
  selectedValues: Topic[];
  setSelectedValues: React.Dispatch<React.SetStateAction<Topic[]>>;
  emptyCommandMessage?: string;
  inputCommandPlaceholder: string;
  placeholderText?: string;
  className?: string;
  Icon?: React.ReactNode;
}

export default function MultiSelectCombobox({
  values,
  selectedValues,
  setSelectedValues,
  emptyCommandMessage = "No options",
  inputCommandPlaceholder,
  placeholderText,
  className,
  Icon,
  ...props
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue: string) => {
    const selected = selectedValues.find(
      (value) => value.name === currentValue
    );
    if (selected) {
      handleRemove(selected);
    } else {
      setSelectedValues((prev) => [
        ...prev,
        values.find((value) => value.name === currentValue)!,
      ]);
    }
  };

  const handleRemove = (valueToRemove: Topic) => {
    setSelectedValues((prev) =>
      prev.filter((value) => value.id !== valueToRemove.id)
    );
  };

  return (
    <div className="">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            {...props}
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} selected`
              : placeholderText || "Select options..."}
            {React.isValidElement(Icon) ? (
              Icon
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command className="w-full">
            <CommandInput
              placeholder={inputCommandPlaceholder}
              className="w-full"
            />
            <CommandList className="w-full">
              <CommandEmpty>{emptyCommandMessage}</CommandEmpty>
              <CommandGroup>
                {values?.map((value) => (
                  <CommandItem
                    key={value.id}
                    value={value.name}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {value.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((value) => (
            <Badge key={value.id} variant="secondary" className="text-sm">
              {values?.find((f) => f.id === value.id)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2"
                onClick={() => handleRemove(value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </Popover>
    </div>
  );
}
