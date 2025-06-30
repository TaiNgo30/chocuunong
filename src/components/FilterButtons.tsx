import clsx from "clsx";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export type FilterButtonsProps<T = string> = {
  options: { label: string; value: T }[];
  value: T | null;
  onSelect?: (value: T) => void;
  listClass?: string;
  buttonClass?: string;
};

const FilterButtons = <T,>(
  { options, value, onSelect = () => { }, listClass, buttonClass }:
    FilterButtonsProps<T>,
) => {
  const [_value, _setValue] = useState<T | null>();
  useEffect(() => {
    _setValue(value);
  }, [value]);

  const handleSelect = (value: T) => {
    _setValue(value);
    onSelect(value);
  };

  return (
    <div className={clsx("flex flex-row gap-2", listClass)}>
      <Button
        className={clsx(
          "inline-flex items-center justify-center px-4 py-2 rounded-md",
          _value == null
            ? "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition"
            : "bg-transparent border border-green-600 text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition",
          buttonClass,
        )}
        onClick={() => handleSelect(null)}
      >
        Tất Cả
      </Button>
      {options.map((option, index) => (
        <Button
          key={index}
          className={clsx(
            "inline-flex items-center justify-center px-4 py-2 rounded-md",
            _value === option.value
              ? "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition"
              : "bg-transparent border border-green-600 text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition",
            buttonClass,
          )}
          onClick={() => handleSelect(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default FilterButtons;
