import React from "react";

interface ChemicalProps {
  id: string;
  name: string;
  formula: string;
  color: string;
  onSelect: (id: string) => void;
  selected: boolean;
  concentration?: string;
  volume?: number;
  disabled?: boolean;
  molecularWeight?: number;
}

export const Chemical: React.FC<ChemicalProps> = ({
  id,
  name,
  formula,
  color,
  onSelect,
  selected,
  concentration,
  volume,
  disabled = false,
  molecularWeight,
}) => {
  // For distilled water we restrict the allowed range to 80-120 mL
  const defaultMin = id === "distilled_water" ? 80 : 1;
  const defaultMax = id === "distilled_water" ? 120 : (volume || 300);
  const initial = id === "distilled_water" ? Math.min(100, defaultMax) : (volume && volume > 0 ? Math.min(25, volume) : 25);

  const [dragAmount, setDragAmount] = React.useState<number>(initial);

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        id,
        name,
        formula,
        color,
        amount: dragAmount,
        concentration,
        molecularWeight,
        volume,
      })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleAddWaterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    // Dispatch a custom event that the WorkBench listens for to add distilled water
    try {
      const ev = new CustomEvent("addDistilledWater", {
        detail: {
          id,
          name,
          amount: dragAmount,
        },
      });
      window.dispatchEvent(ev);
    } catch (err) {
      // fallback: nothing
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : disabled
          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
          : "border-gray-300 bg-white hover:border-blue-300 hover:shadow-sm"
      }`}
      onClick={() => !disabled && onSelect(id)}
      draggable={!disabled}
      onDragStart={handleDragStart}
    >
      <div className="space-y-2">
        {/* Chemical Preview */}
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{name}</h3>
            <p className="text-xs text-gray-600 font-mono">{formula}</p>
          </div>
        </div>

        {/* Chemical Properties */}
        <div className="space-y-1 text-xs text-gray-600">
          {concentration && (
            <div className="flex justify-between">
              <span>Concentration:</span>
              <span className="font-medium">{concentration}</span>
            </div>
          )}
          {volume !== undefined && volume > 0 && (
            <div className="flex justify-between">
              <span>Volume:</span>
              <span className="font-medium">{volume} mL</span>
            </div>
          )}
          {molecularWeight && (
            <div className="flex justify-between">
              <span>MW:</span>
              <span className="font-medium">{molecularWeight} g/mol</span>
            </div>
          )}
        </div>

        {/* Amount Control for liquids */}
        {!disabled && volume !== undefined && volume > 0 && (
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Amount to use:</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min={defaultMin}
                max={defaultMax}
                value={dragAmount}
                onChange={(e) => setDragAmount(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-xs font-medium w-12 text-right">{dragAmount} mL</span>
            </div>
          </div>
        )}

        {/* Add button specifically for distilled water so users can quickly add the chosen amount */}
        {id === "distilled_water" && !disabled && (
          <div className="mt-2 flex justify-center">
            <button
              onClick={handleAddWaterClick}
              className="px-3 py-1 rounded-md bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium"
            >
              Add {dragAmount} mL
            </button>
          </div>
        )}

        {/* Drag Indicator */}
        {!disabled && (
          <div className="text-center">
            <p className="text-xs text-blue-600 mt-2">{id === "oxalic_acid" ? "Drag to balance" : "Drag to add"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chemical;
