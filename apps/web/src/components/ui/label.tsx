import React from 'react';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className = '', ...props }) => {
  return <label className={["block text-sm font-medium text-neutral-900", className].join(' ').trim()} {...props} />;
};

export default Label;


