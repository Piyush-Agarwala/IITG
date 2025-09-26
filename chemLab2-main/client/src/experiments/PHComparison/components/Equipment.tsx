import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Beaker, Droplets, FlaskConical, TestTube } from "lucide-react";

interface EquipmentProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  onDrag?: (id: string, x: number, y: number) => void;
  position?: { x: number; y: number } | null;
  onRemove?: (id: string) => void;
  disabled?: boolean;
  color?: string;
  volume?: number;
  displayVolume?: number;
  onInteract?: (id: string) => void;
  isActive?: boolean;
}

export const Equipment: React.FC<EquipmentProps> = ({
  id,
  name,
  icon,
  onDrag,
  position,
  onRemove,
  disabled = false,
  color = "#e5e7eb",
  volume = 0,
  displayVolume,
  onInteract,
  isActive = false,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (disabled || position) return;
    e.dataTransfer.setData("equipment", id);
  };

  const handleClick = () => {
    if (onInteract && position) onInteract(id);
  };

  // Toolbar item
  if (!position) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable={!disabled}
            onDragStart={handleDragStart}
            className={`flex flex-col items-center p-4 rounded-lg border-2 ${
              disabled ? 'border-gray-200 bg-gray-50 opacity-50' : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-lg'
            }`}
          >
            <div className="text-3xl mb-2 text-blue-600">{icon}</div>
            <span className="text-sm font-medium text-gray-700 text-center">{name}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Drag to workbench: {name}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Placed item
  return (
    <div style={{ position: 'absolute', left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }} className="relative group">
      <div className={`relative ${id === 'test-tube' ? 'min-w-[240px] min-h-[360px]' : 'bg-white rounded-xl shadow-lg border-2 p-4 min-w-[90px] min-h-[120px]'} ${isActive && id !== 'test-tube' ? 'border-blue-400 shadow-xl' : 'border-gray-200'}`} onClick={handleClick}>
        {onRemove && (
          <Button onClick={(e) => { e.stopPropagation(); onRemove(id); }} size="sm" variant="outline" className={`absolute w-6 h-6 p-0 bg-red-500 text-white border-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity ${id === 'test-tube' ? 'top-0 right-0' : '-top-2 -right-2'}`}>
            <X className="w-3 h-3" />
          </Button>
        )}

        <div className="flex flex-col items-center">
          {id === 'test-tube' ? (
            <div className="relative">
              <div className="relative w-32 h-72">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded-full border text-[10px] font-semibold text-gray-700">
                  {(displayVolume ?? volume ?? 0).toFixed(1)} mL
                </div>
                <img src="https://cdn.builder.io/api/v1/image/assets%2Fc52292a04d4c4255a87bdaa80a28beb9%2F3dd94cfaa2fc4876a1e3759c6d76db7e?format=webp&width=800" alt="Test tube" className="w-full h-full object-contain" />
                {(displayVolume ?? volume ?? 0) > 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2 transition-all" style={{ bottom: '28px', width: '28px', height: '150px', overflow: 'hidden', borderRadius: '0 0 14px 14px' }}>
                    <div
                      className="absolute left-0 right-0 bottom-0 transition-all duration-500"
                      style={{
                        height: `${Math.max(0, Math.min(150, ((Math.min(Math.max(displayVolume ?? volume ?? 0, 0), 20) / 20) * 150)))}px`,
                        backgroundColor: color,
                        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.25), 0 0 3px rgba(0,0,0,0.1)',
                        opacity: 0.85,
                      }}
                    />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium mt-2 text-center block">{name}</span>
            </div>
          ) : id === 'hcl-0-01m' ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 border-2 border-gray-300 relative overflow-hidden mb-2 shadow-sm" style={{ backgroundColor: '#fffacc' }}>
                <Droplets className="w-7 h-7 absolute top-2 left-1/2 -translate-x-1/2 text-yellow-700 opacity-70" />
              </div>
              <span className="text-xs font-medium text-center">0.01 M HCl</span>
            </div>
          ) : id === 'acetic-0-01m' || id === '0-1-m-ethanoic-acetic-acid' || name.toLowerCase().includes('ethanoic (acetic) acid') ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 border-2 border-gray-300 relative overflow-hidden mb-2 shadow-sm" style={{ backgroundColor: '#fffacc' }}>
                <Droplets className="w-7 h-7 absolute top-2 left-1/2 -translate-x-1/2 text-yellow-700 opacity-70" />
              </div>
              <span className="text-xs font-medium text-center">{name}</span>
            </div>
          ) : id === 'universal-indicator' ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 border-2 border-gray-300 relative overflow-hidden mb-2 shadow-sm" style={{ backgroundColor: '#e1bee7' }}>
                <FlaskConical className="w-7 h-7 absolute top-2 left-1/2 -translate-x-1/2 text-purple-700 opacity-70" />
              </div>
              <span className="text-xs font-medium text-center">Universal Indicator</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-2 text-blue-600">{icon}</div>
              <span className="text-xs font-medium text-center">{name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PH_LAB_EQUIPMENT = [
  { id: 'test-tube', name: '20 mL Test Tube', icon: <TestTube className="w-8 h-8" /> },
  { id: 'hcl-0-01m', name: '0.01 M HCl', icon: <Droplets className="w-8 h-8" /> },
  { id: 'acetic-0-01m', name: '0.1 M Ethanoic (Acetic) Acid', icon: <Droplets className="w-8 h-8" /> },
  { id: 'universal-indicator', name: 'Universal Indicator', icon: <FlaskConical className="w-8 h-8" /> },
];
