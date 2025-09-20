import React from 'react';

export function IecLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 9l-10-5-10 5 10 5 10-5z" />
      <path d="M4 9v6l8 4 8-4V9" />
      <path d="M12 19V9" />
    </svg>
  );
}
