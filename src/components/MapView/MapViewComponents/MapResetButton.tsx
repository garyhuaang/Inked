import { MapResetButtonProps } from '../MapView.types';
import { RotateCcw } from 'lucide-react';

export const MapResetButton = ({ onReset }: MapResetButtonProps) => {
  return (
    <div className="maplibregl-ctrl maplibregl-ctrl-group absolute top-20 right-2.5 z-10 shadow-md">
      <button
        type="button"
        aria-label="Reset map view"
        onClick={onReset}
        className="flex! items-center justify-center"
      >
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
};
