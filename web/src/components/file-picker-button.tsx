"use client";

import { ChangeEvent, useId, useRef } from "react";

import { Button } from "@/components/ui/button";

type FilePickerButtonProps = {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
};

export function FilePickerButton({ onFilesSelected, disabled }: FilePickerButtonProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    onFilesSelected(files);
    event.target.value = "";
  };

  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        Pick sheet files
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.4sc,.4ss,application/pdf"
        onChange={onChange}
        disabled={disabled}
      />
      <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={disabled}>
        Browse Device
      </Button>
    </>
  );
}
