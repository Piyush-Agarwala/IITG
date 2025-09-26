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
        {/* Equipment & Chemicals Panel */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          {/* Equipment Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Equipment</h3>
            <div className="grid grid-cols-2 gap-3">
              {equipment.map((eq) => (
                <Equipment
                  key={eq.id}
                  id={eq.id}
                  name={eq.name}
                  icon={eq.icon}
                  onDrag={handleEquipmentDrag}
                  position={null}
                />
              ))}
            </div>
          </div>

          {/* Chemicals Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Chemicals</h3>
            <div className="space-y-3">
              {chemicals.map((chemical) => (
                <Chemical
                  key={chemical.id}
                  id={chemical.id}
                  name={chemical.name}
                  formula={chemical.formula}
                  color={chemical.color}
                  concentration={chemical.concentration}
                  volume={chemical.volume}
                  molecularWeight={chemical.molecularWeight}
                  onSelect={setSelectedChemical}
                  selected={selectedChemical === chemical.id}
                  disabled={chemical.id === "oxalic_acid" && preparationState.oxalicAcidAdded}
                />
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Measurements</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Target Mass:</span>
                <span className="font-mono">{measurements.targetMass.toFixed(4)} g</span>
              </div>
              <div className="flex justify-between">
                <span>Weighed Mass:</span>
                <span className="font-mono">{measurements.massWeighed.toFixed(4)} g</span>
              </div>
              <div className="flex justify-between">
                <span>Target Molarity:</span>
                <span className="font-mono">{measurements.targetMolarity.toFixed(3)} M</span>
              </div>
              <div className="flex justify-between">
                <span>Actual Molarity:</span>
                <span className="font-mono">{measurements.actualMolarity.toFixed(6)} M</span>
              </div>
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span className="font-mono">{temperature}°C</span>
              </div>
            </div>
          </div>

          {/* Chemical Equation */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Chemical Equation</h3>
            <div className="text-xs font-mono bg-gray-50 rounded-lg p-3 border text-center leading-relaxed">
              <div>H₂C₂O₄·2H₂O (s) → H₂C₂O₄ (aq) + 2H₂O</div>
              <div className="mt-1">H₂C₂O₄ (aq) ⇌ 2H⁺ + C₂O₄²⁻</div>
            </div>
            <div className="text-center text-xs text-gray-500 mt-2">Dissolution and acid dissociation</div>
          </div>

          {/* Current Step Action */}
          {canProceed && (
            <div className="mb-4">
              <Button
                onClick={onStepAction}
                className="w-full"
                variant="default"
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                Complete Step {stepNumber}
              </Button>
            </div>
          )}

          {/* Undo and Reset Controls */}
          <div className="space-y-2">
            <Button
              onClick={onUndoStep}
              variant="outline"
              className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              disabled={stepNumber <= 1}
            >
              Undo Step {currentStepIndex}
            </Button>
            <Button
              onClick={onResetExperiment}
              variant="outline"
              className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              Reset Experiment
            </Button>
          </div>
        </div>

        {/* Workbench Area */}
        <div className="flex-1 flex flex-col">
          {/* Workbench Surface (styled like Titration1) */}
          <div
            data-workbench="true"
            className={`flex-1 relative w-full min-h-[500px] rounded-lg overflow-hidden transition-all duration-300 border-2 border-dashed ${
              isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            } transform -translate-y-8`}
            style={{
              backgroundImage: `
                linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%),
                radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 25%),
                radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.08) 0%, transparent 25%)
              `,
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Surface pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                  linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                  linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            />

            {/* Step indicator */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200 z-10">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Step {stepNumber} of {totalSteps}</span>
              </div>
            </div>

            {/* Workbench title */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200 z-10">
              <span className="text-sm font-medium text-gray-700">Preparation Workbench</span>
            </div>

            {/* White tile for visibility */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-32 h-24 bg-white border-2 border-gray-300 rounded-lg shadow-md">
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-gray-500 text-center">White Tile</span>
              </div>
            </div>

            {/* Drop zone overlay */}
            {isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm z-20">
                <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-blue-400 border-dashed">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-blue-600">Drop Equipment Here</p>
                    <p className="text-sm text-gray-600 text-center">Position your equipment on the workbench</p>
                  </div>
                </div>
              </div>
            )}

            {/* Equipment on workbench */}
            {equipmentPositions.map((position) => {
              const equipmentData = equipment.find(eq => position.id.startsWith(eq.id));

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

            {/* Empty state overlay */}
            {!experimentStarted && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <FlaskConical className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Virtual Laboratory</p>
                  <p className="text-sm">Drag equipment here to start</p>
                </div>
              </div>
            )}

            {/* Grid lines */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />
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
