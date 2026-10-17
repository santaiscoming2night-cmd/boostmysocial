'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, className = 'btn btn-primary', pendingText = 'Please wait…', ...rest }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} {...rest}>
      {pending ? pendingText : children}
    </button>
  );
}
