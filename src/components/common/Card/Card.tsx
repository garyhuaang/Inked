import {
  Card as ShadcnCard,
  CardContent,
  CardHeader,
  CardFooter,
  CardDescription,
  CardAction,
  CardTitle,
} from '../shadcnui/card';
import { cn } from '@/lib/utils';
import type { CardProps } from './Card.types';

export function Card({
  header,
  onToggle,
  selected,
  title,
  description,
  content,
  contentList,
  emptyContent,
  footer,
  action,
  onAction,
  className,
}: CardProps) {
  const hasHeaderBlock = Boolean(header || title || description || action);

  const resolvedContent =
    content ??
    (contentList ? (
      contentList.length > 0 ? (
        <ul className="space-y-1.5">{contentList}</ul>
      ) : (
        emptyContent
      )
    ) : null);

  return (
    // `relative` anchors the toggle button's stretched hit area; selection
    // visuals ride the same prop as aria-pressed so they cannot disagree.
    <ShadcnCard
      className={cn(
        'gap-3 py-4',
        onToggle && 'relative transition-colors',
        onToggle &&
          (selected ? 'border-primary bg-accent' : 'hover:bg-accent/50'),
        className,
      )}
    >
      {hasHeaderBlock ? (
        <CardHeader className="px-4">
          {title ? <CardTitle>{title}</CardTitle> : null}
          {header && onToggle ? (
            <h3 className="text-base leading-snug font-medium">
              <button
                type="button"
                onClick={onToggle}
                aria-pressed={selected ?? false}
                className="cursor-pointer text-left after:absolute after:inset-0"
              >
                {header}
              </button>
            </h3>
          ) : (
            header
          )}
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
          {action ? (
            <CardAction>
              {onAction ? (
                <button
                  type="button"
                  onClick={onAction}
                  className="cursor-pointer"
                >
                  {action}
                </button>
              ) : (
                action
              )}
            </CardAction>
          ) : null}
        </CardHeader>
      ) : null}
      {resolvedContent ? (
        <CardContent className="px-4">{resolvedContent}</CardContent>
      ) : null}
      {footer ? <CardFooter className="px-4">{footer}</CardFooter> : null}
    </ShadcnCard>
  );
}
