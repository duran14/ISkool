"use client";

import { useEffect, useState } from 'react';

interface FormattedDateProps {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
  prefix?: string;
  className?: string;
}

export function FormattedDate({ date, options, prefix = '', className = '' }: FormattedDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>...</span>;
  }

  try {
    const formatted = new Date(date).toLocaleDateString('es-MX', options || {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    return <span className={className}>{prefix}{formatted}</span>;
  } catch (e) {
    return <span className={className}>...</span>;
  }
}
