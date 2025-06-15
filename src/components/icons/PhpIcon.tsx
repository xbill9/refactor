import type { SVGProps } from 'react';

export function PhpIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 18H7.5C6.11929 18 5 16.8807 5 15.5V8.5C5 7.11929 6.11929 6 7.5 6H16.5C17.8807 6 19 7.11929 19 8.5V11" />
      <path d="M9 10H11" />
      <path d="M10 10V14" />
      <path d="M13 10H15" />
      <path d="M14 10V14" />
      <path d="M14 12H13" />
      <ellipse cx="12" cy="12" rx="3" ry="2" />
      <path d="M18 14v6" />
      <path d="M15 17h6" />
    </svg>
  );
}
