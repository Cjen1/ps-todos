import * as React from "react";
import useLongPress from "@/lib/useLongPress";
import { cn } from "@/lib/utils";

type LongPressCheckboxProps = {
    onShortPress?: () => void;
    onLongPress?: () => void;
    checked: boolean;
};

export function LongPressCheckbox({
    className,
    onShortPress = () => { },
    onLongPress = () => { },
    checked = false,
    ...props
}: LongPressCheckboxProps & React.ComponentProps<"button">) {
    const longPressCallbacks = useLongPress(onLongPress, onShortPress);

    return (
        <button
            type="button"
            className={cn(
                "w-6 h-6 rounded-sm border-2 border-primary bg-card",
                !checked ? "bg-primary" : "bg-card",
                className
            )}
            {...longPressCallbacks}
            {...props}
        />
    );
}