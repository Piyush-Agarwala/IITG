import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Equipment } from "./Equipment";
import { Chemical } from "./Chemical";
import { Play, Pause, RotateCcw, Calculator, FlaskConical } from "lucide-react";
import type {
  EquipmentPosition,
  SolutionPreparationState,
  Measurements,
  Result,
  ExperimentStep,
  Chemical as ChemicalType,
  Equipment as EquipmentType,
} from "../types";

interface WorkBenchProps {
  step: ExperimentStep;
  experimentStarted: boolean;
  onStartExperiment: () => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  onResetTimer: () => void;
  stepNumber: number;
  totalSteps: number;
  experimentTitle: string;
  onStepAction: () => void;
  canProceed: boolean;
  equipmentPositions: EquipmentPosition[];
  setEquipmentPositions: React.Dispatch<React.SetStateAction<EquipmentPosition[]>>;
  preparationState: SolutionPreparationState;
  measurements: Measurements;
  results: Result[];
  chemicals: ChemicalType[];
  equipment: EquipmentType[];
  onUndoStep: () => void;
  onResetExperiment: () => void;
  currentStepIndex: number;
}

export const WorkBench: React.FC<WorkBenchProps> = ({
  step,
  experimentStarted,
  onStartExperiment,
  isRunning,
  setIsRunning,
  onResetTimer,
  stepNumber,
  totalSteps,
  experimentTitle,
  onStepAction,
  canProceed,
  equipmentPositions,
  setEquipmentPositions,
  preparationState,
  measurements,
  results,
  chemicals,
  equipment,
  onUndoStep,
  onResetExperiment,
  currentStepIndex,
}) => {
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    if (isRunning) {
      const tempInterval = setInterval(() => {
        setTemperature((prev) => {
          const variation = (Math.random() - 0.5) * 0.5;
          return Math.round((prev + variation) * 10) / 10;
        });
      }, 2000);

      return () => clearInterval(tempInterval);
    }
  }, [isRunning]);

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

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // If the dragged item includes concentration or volume, treat it as a chemical and create a bottle
      if (data.concentration || data.volume) {
        setEquipmentPositions(prev => [
          ...prev,
          {
            id: `${data.id}_${Date.now()}`,
            x: x - 30,
            y: y - 30,
            isBottle: true,
            chemicals: [
              {
                id: data.id,
                name: data.name,
                color: data.color || "#87CEEB",
                amount: data.amount || (data.volume || 50),
                concentration: data.concentration || "",
              }
            ],
          }
        ]);
        return;
      }

      // Add equipment to workbench
      if (data.id && data.name) {
        setEquipmentPositions(prev => [
          ...prev,
          {
            id: `${data.id}_${Date.now()}`,
            x: x - 50,
            y: y - 50,
            chemicals: [],
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to parse drop data:", error);
    }
  };

  const handleEquipmentDrag = (id: string, x: number, y: number) => {
    setEquipmentPositions(prev =>
      prev.map(pos =>
        pos.id === id ? { ...pos, x, y } : pos
      )
    );
  };

  const handleChemicalDrop = (chemicalId: string, equipmentId: string, amount: number) => {
    setEquipmentPositions(prev =>
      prev.map(pos => {
        if (pos.id === equipmentId) {
          const chemical = chemicals.find(c => c.id === chemicalId);
          if (chemical) {
            return {
              ...pos,
              chemicals: [
                ...pos.chemicals,
                {
                  id: chemicalId,
                  name: chemical.name,
                  color: chemical.color,
                  amount: amount,
                  concentration: chemical.concentration,
                }
              ]
            };
          }
        }
        return pos;
      })
    );
  };

  const handleEquipmentRemove = (id: string) => {
    setEquipmentPositions(prev => prev.filter(pos => pos.id !== id));
  };

  const handleEquipmentAction = (action: string) => {
    switch (action) {
      case "weigh":
      case "stir":
      case "adjust_volume":
        onStepAction();
        break;
    }
  };

  const getCurrentStepGuidance = () => {
    switch (step.id) {
      case 1:
        return "Use the calculator to determine the required mass of oxalic acid dihydrate";
      case 2:
        return "Drag the analytical balance to the workbench and weigh the oxalic acid";
      case 3:
        return "Add oxalic acid to a beaker with distilled water and stir";
      case 4:
        return "Transfer the dissolved solution to a volumetric flask";
      case 5:
        return "Add distilled water until near the 250 mL mark";
      case 6:
        return "Use dropper to carefully reach the exact volume mark";
      case 7:
        return "Mix the solution thoroughly by inversion";
      default:
        return "Follow the current step instructions";
    }
  };

  const getStepProgress = () => {
    const progress = ((stepNumber - 1) / totalSteps) * 100;
    return Math.round(progress);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Step {stepNumber}: {step.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {getCurrentStepGuidance()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowCalculator(!showCalculator)}
              variant="outline"
              size="sm"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculator
            </Button>
            {!experimentStarted ? (
              <Button onClick={onStartExperiment} size="sm">
                <Play className="w-4 h-4 mr-2" />
                Start Experiment
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  variant={isRunning ? "secondary" : "default"}
                  size="sm"
                >
                  {isRunning ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button onClick={onResetTimer} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Step Progress */}
        <div className="mt-3 flex items-center space-x-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {stepNumber}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">

        {/* Workbench Area */}
        <div className="flex-1 flex flex-col">
          {/* Workbench Surface */}
          <div
            className={`flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 ${
              isDragOver ? "bg-blue-50 border-2 border-dashed border-blue-400" : ""
            } transform -translate-y-8`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Equipment on workbench */}
            {equipmentPositions.map((position) => {
              const equipmentData = equipment.find(eq => position.id.startsWith(eq.id));

              // If this position corresponds to a known equipment, render normally
              if (equipmentData) {
                return (
                  <Equipment
                    key={position.id}
                    id={position.id}
                    name={equipmentData.name}
                    icon={equipmentData.icon}
                    onDrag={handleEquipmentDrag}
                    position={{ x: position.x, y: position.y }}
                    chemicals={position.chemicals}
                    onChemicalDrop={handleChemicalDrop}
                    onRemove={handleEquipmentRemove}
                    preparationState={preparationState}
                    onAction={handleEquipmentAction}
                  />
                );
              }

              // If no equipment data found but chemicals exist, render a bottle-like equipment
              if (position.chemicals && position.chemicals.length > 0) {
                const chem = position.chemicals[0];
                const bottleIcon = (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
                    <path d="M8 2h8v2h1v2l-1 2v6a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V8L7 6V4h1V2z" stroke="currentColor" strokeWidth="1.2" fill="rgba(135,206,235,0.15)" />
                    <path d="M9 4h6" stroke="currentColor" strokeWidth="1" />
                  </svg>
                );

                return (
                  <Equipment
                    key={position.id}
                    id={position.id}
                    name={`${chem.name} Bottle`}
                    icon={bottleIcon}
                    onDrag={handleEquipmentDrag}
                    position={{ x: position.x, y: position.y }}
                    chemicals={position.chemicals}
                    onChemicalDrop={handleChemicalDrop}
                    onRemove={handleEquipmentRemove}
                    preparationState={preparationState}
                    onAction={handleEquipmentAction}
                  />
                );
              }

              return null;
            })}

            {/* Drop Zone Indicator */}
            {!experimentStarted && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <FlaskConical className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Virtual Laboratory</p>
                  <p className="text-sm">Drag equipment here to start</p>
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="h-32 bg-white border-t border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Observations & Results
            </h3>
            <div className="space-y-1">
              {results.slice(-3).map((result) => (
                <div
                  key={result.id}
                  className={`text-xs p-2 rounded-md ${
                    result.type === "success"
                      ? "bg-green-50 text-green-800"
                      : result.type === "warning"
                      ? "bg-yellow-50 text-yellow-800"
                      : result.type === "error"
                      ? "bg-red-50 text-red-800"
                      : "bg-blue-50 text-blue-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className="mt-1">{result.description}</p>
                </div>
              ))}
              {results.length === 0 && (
                <p className="text-xs text-gray-500 italic">
                  No observations yet. Start the experiment to see results.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Molarity Calculator</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCalculator(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium">Molarity (M):</label>
                  <div className="font-mono bg-gray-100 p-2 rounded">0.1 M</div>
                </div>
                <div>
                  <label className="font-medium">Volume (L):</label>
                  <div className="font-mono bg-gray-100 p-2 rounded">0.25 L</div>
                </div>
                <div>
                  <label className="font-medium">MW (g/mol):</label>
                  <div className="font-mono bg-gray-100 p-2 rounded">126.07</div>
                </div>
                <div>
                  <label className="font-medium">Mass (g):</label>
                  <div className="font-mono bg-blue-100 p-2 rounded font-bold">
                    {(0.1 * 0.25 * 126.07).toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Formula:</strong> m = M × V × MW</p>
                <p><strong>Calculation:</strong> {(0.1 * 0.25 * 126.07).toFixed(4)} g = 0.1 M × 0.25 L × 126.07 g/mol</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkBench;
