import { Skeleton } from '../../common/shadcnui/skeleton';

export function ShopListSkeletons() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}
