import type { ReactNode } from 'react';

export type CardProps = {
  header?: ReactNode;
  onToggle?: () => void;
  selected?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  contentList?: ReactNode[];
  emptyContent?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  onAction?: () => void;
  className?: string;
};
