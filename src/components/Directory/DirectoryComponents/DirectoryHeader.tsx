import type { DirectoryHeaderProps } from '../Directory.types';

export function DirectoryHeader({ isError }: DirectoryHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Inked</h1>
        <p className="text-xs text-muted-foreground">
          Tattoo artists across the DFW and Austin metros
        </p>
      </div>
      {isError ? (
        <p role="alert" className="text-xs text-destructive">
          Could not load this area.
        </p>
      ) : null}
    </header>
  );
}
