import type { ReactNode } from 'react';

export type CardProps = {
  header?: ReactNode;
  onToggle?: () => void;
  selected?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  onAction?: () => void;
  className?: string;
};
