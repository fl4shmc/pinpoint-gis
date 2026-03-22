import type { ComponentPropsWithoutRef } from "react";

type FormInputProps = Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export function FormInput({ value, onChange, ...props }: FormInputProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      {...props}
    />
  );
}
