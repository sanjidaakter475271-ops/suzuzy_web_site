"use client";

import * as React from "react";
import { X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
}: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i) => i !== item));
    };

    return (
        <Command className="overflow-visible bg-transparent">
            <div
                className="group border border-white/10 px-3 py-2 text-sm ring-offset-background rounded-xl bg-white/[0.03] focus-within:ring-2 focus-within:ring-[#D4AF37] focus-within:ring-offset-2"
            >
                <div className="flex flex-wrap gap-1">
                    {selected.map((item) => {
                        const option = options.find((o) => o.value === item);
                        return (
                            <Badge
                                key={item}
                                variant="secondary"
                                className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border-[#D4AF37]/20"
                            >
                                {option?.label || item}
                                <button
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnselect(item);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={() => handleUnselect(item)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        );
                    })}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setTimeout(() => setOpen(false), 200)}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder}
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-white/30 text-white"
                    />
                </div>
            </div>
            <div className="relative">
                {open && (
                    <div className="absolute bottom-full z-10 w-full mb-2 animate-in fade-in-0 zoom-in-95">
                        <CommandList className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#0D0D0F] shadow-2xl outline-none animate-in z-50">
                            <CommandGroup className="h-full overflow-auto max-h-[200px]">
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                            onChange(
                                                selected.includes(option.value)
                                                    ? selected.filter((item) => item !== option.value)
                                                    : [...selected, option.value]
                                            );
                                            setInputValue("");
                                        }}
                                        onClick={() => {
                                            onChange(
                                                selected.includes(option.value)
                                                    ? selected.filter((item) => item !== option.value)
                                                    : [...selected, option.value]
                                            );
                                            setInputValue("");
                                        }}
                                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] data-[selected=true]:bg-[#D4AF37]/10 text-white"
                                    >
                                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                            {selected.includes(option.value) && (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </span>
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                )}
            </div>
        </Command>
    );
}
