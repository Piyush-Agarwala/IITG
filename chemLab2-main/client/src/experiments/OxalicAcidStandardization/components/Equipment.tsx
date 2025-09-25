import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Scale,
  FlaskConical,
  Beaker,
  Pipette,
} from "lucide-react";
import StirringAnimation from "./StirringAnimation";
import DissolutionAnimation from "./DissolutionAnimation";
import type { EquipmentPosition, SolutionPreparationState } from "../types";

interface EquipmentProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  onDrag: (id: string, x: number, y: number) => void;
  position: { x: number; y: number } | null;
  chemicals?: Array<{
    id: string;
    name: string;
    color: string;
    amount: number;
    concentration: string;
  }>;
  onChemicalDrop?: (
    chemicalId: string,
    equipmentId: string,
    amount: number,
  ) => void;
  onRemove?: (id: string) => void;
  preparationState?: SolutionPreparationState;
  onAction?: (action: string) => void;
}

export const Equipment: React.FC<EquipmentProps> = ({
  id,
  name,
  icon,
  onDrag,
  position,
  chemicals = [],
  onChemicalDrop,
  onRemove,
  preparationState,
  onAction,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const equipmentRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (position) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  }, [position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && position) {
        const rect = equipmentRef.current?.parentElement?.getBoundingClientRect();
        if (rect) {
          const newX = e.clientX - rect.left - dragOffset.x;
          const newY = e.clientY - rect.top - dragOffset.y;
          onDrag(id, newX, newY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, onDrag, id, position]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (onChemicalDrop) {
        onChemicalDrop(data.id, id, data.amount);
      }
    } catch (error) {
      console.error("Failed to parse drop data:", error);
    }
  }, [onChemicalDrop, id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const getEquipmentContent = () => {
    const totalVolume = chemicals.reduce((sum, chemical) => sum + chemical.amount, 0);
    
    switch (id) {
      case "analytical_balance":
        const oxalicAcid = chemicals.find(c => c.id === "oxalic_acid");
        return (
          <div className="text-center">
            <Scale className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <div className="text-xs space-y-1">
              <div>Digital Display</div>
              {oxalicAcid && (
                <div className="bg-black text-green-400 px-2 py-1 rounded font-mono">
                  {(oxalicAcid.amount / 1000).toFixed(4)} g
                </div>
              )}
            </div>
          </div>
        );
        
      case "volumetric_flask":
        const isAtMark = preparationState?.finalVolume;
        const isNearMark = preparationState?.nearMark;
        return (
          <div className="text-center relative">
            <FlaskConical className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-xs space-y-1">
              <div>250 mL</div>
              {chemicals.length > 0 && (
                <div 
                  className="w-6 h-8 mx-auto rounded-b-full border"
                  style={{
                    backgroundColor: chemicals[0]?.color || "#87CEEB",
                    opacity: 0.7,
                    height: isAtMark ? "32px" : isNearMark ? "28px" : "20px"
                  }}
                />
              )}
              {isAtMark && (
                <div className="text-green-600 font-bold">At Mark!</div>
              )}
            </div>
          </div>
        );
        
      case "beaker":
        const hasOxalicAcid = chemicals.some(c => c.id === "oxalic_acid");
        const hasWater = chemicals.some(c => c.id === "distilled_water");

        return (
          <div className="text-center relative">
            <Beaker className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <div className="text-xs space-y-1">
              <div>100 mL</div>

              {/* Show stirring animation when both chemicals are present and stirring is active */}
              {preparationState?.stirrerActive && hasOxalicAcid && hasWater ? (
                <StirringAnimation
                  isActive={true}
                  containerWidth={32}
                  containerHeight={48}
                  stirringSpeed="medium"
                  solutionColor="#87ceeb"
                />
              ) : chemicals.length > 0 ? (
                <div
                  className="w-4 h-6 mx-auto rounded-b border"
                  style={{
                    backgroundColor: chemicals[0]?.color || "#87CEEB",
                    opacity: 0.7,
                    height: `${Math.min(24, totalVolume / 2)}px`
                  }}
                />
              ) : null}

              {/* Show dissolution animation when crystals are dissolving */}
              {hasOxalicAcid && hasWater && !preparationState?.dissolved && (
                <div className="absolute inset-0 pointer-events-none">
                  <DissolutionAnimation
                    isActive={true}
                    containerWidth={32}
                    containerHeight={48}
                    onComplete={() => {}}
                  />
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center">
            {icon}
            <div className="text-xs mt-1">{name}</div>
          </div>
        );
    }
  };

  const canAcceptChemical = (chemicalId: string) => {
    switch (id) {
      case "analytical_balance":
        return chemicalId === "oxalic_acid";
      case "beaker":
        return true;
      case "volumetric_flask":
        return preparationState?.transferredToFlask || false;
      default:
        return false;
    }
  };

  const getActionButton = () => {
    switch (id) {
      case "analytical_balance":
        if (chemicals.some(c => c.id === "oxalic_acid")) {
          return (
            <button
              onClick={() => onAction?.("weigh")}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Record Weight
            </button>
          );
        }
        break;
      case "beaker":
        if (chemicals.length > 0 && !preparationState?.dissolved) {
          return (
            <button
              onClick={() => onAction?.("stir")}
              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              Stir
            </button>
          );
        }
        break;
      case "volumetric_flask":
        if (preparationState?.nearMark && !preparationState?.finalVolume) {
          return (
            <button
              onClick={() => onAction?.("adjust_volume")}
              className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
            >
              Make to Mark
            </button>
          );
        }
        break;
    }
    return null;
  };

  if (!position) {
    return (
      <div
        className={`p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-grab hover:border-blue-400 transition-colors ${
          isHovered ? "shadow-md" : ""
        }`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify({ id, name }));
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center">
          {icon}
          <p className="text-xs font-medium mt-2 text-gray-700">{name}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={equipmentRef}
      className={`absolute bg-white rounded-lg border-2 p-3 shadow-lg cursor-move select-none transition-all ${
        isDragging 
          ? "border-blue-500 shadow-xl scale-105" 
          : "border-gray-300 hover:border-blue-400"
      }`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 1000 : 10,
      }}
      onMouseDown={handleMouseDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {getEquipmentContent()}
      
      {/* Action Button */}
      <div className="mt-2">
        {getActionButton()}
      </div>
      
      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
        >
          ×
        </button>
      )}
      
      {/* Details Tooltip */}
      {showDetails && chemicals.length > 0 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs rounded p-2 whitespace-nowrap z-50">
          <div className="space-y-1">
            {chemicals.map((chemical, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: chemical.color }}
                />
                <span>{chemical.name}: {chemical.amount}g</span>
              </div>
            ))}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black" />
        </div>
      )}
    </div>
  );
};

export default Equipment;
