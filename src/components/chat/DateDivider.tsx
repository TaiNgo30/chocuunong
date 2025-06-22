import * as React from 'react';

interface Props {
  label: string;
}

const DateDivider: React.FC<Props> = ({ label }) => (
  <div className="flex justify-center my-4">
    <span className="px-4 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
      {label}
    </span>
  </div>
);

export default DateDivider;
