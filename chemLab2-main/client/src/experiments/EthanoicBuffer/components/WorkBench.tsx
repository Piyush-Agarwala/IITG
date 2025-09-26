import React, { useState } from "react";

interface WorkBenchProps {
  // action will be 'new' when dragging from toolbar, 'move' when repositioning an existing item
  onDrop: (id: string, x: number, y: number, action?: 'new' | 'move') => void;
  children: React.ReactNode;
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
}

export const WorkBench: React.FC<WorkBenchProps> = ({
  onDrop,
  children,
  isRunning,
  currentStep,
  totalSteps,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // read structured data if available
    const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("equipment");
    let parsed: { id?: string; type?: string; offsetX?: number; offsetY?: number } | null = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch (err) {
      // if not JSON, treat raw as id
      parsed = raw ? { id: raw, type: 'new' } : null;
    }

    if (parsed && parsed.id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Use the drop point as the center coordinates for placement to match the component's centering transform
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const action = parsed.type === 'move' ? 'move' : 'new';
      onDrop(parsed.id, x, y, action);
    }
  };

  return (
    <div
      data-workbench="true"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full min-h-[500px] bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg overflow-hidden transition-all duration-300 border-2 border-dashed ${
        isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
      }`}
      style={{
        backgroundImage: `
          linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%),
          radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 25%),
          radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 25%)
        `,
      }}
    >
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? "bg-green-500" : "bg-gray-400"} ${isRunning ? "animate-pulse" : ""}`}></div>
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Laboratory Workbench</span>
      </div>

      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-blue-400 border-dashed">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-blue-600">Drop Equipment Here</p>
              <p className="text-sm text-gray-600 text-center">Position your laboratory equipment on the workbench</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 p-8 transform -translate-y-8">{children}</div>
    </div>
  );
};
