import React, { useState, useEffect, useRef, useCallback } from "react";
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
  onEquipmentPlaced?: (id: string) => void;
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
  onEquipmentPlaced,
  onUndoStep,
  onResetExperiment,
  currentStepIndex,
}) => {
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [showCalculator, setShowCalculator] = useState(false);
  const [workbenchMessage, setWorkbenchMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<number | null>(null);

  const showMessage = useCallback((text: string) => {
    setWorkbenchMessage(text);
    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = window.setTimeout(() => {
      setWorkbenchMessage(null);
      messageTimeoutRef.current = null;
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, []);

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

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const raw = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/uri-list") || "";
    const isStepOne = step.id === 1;
    const allowedStepOneEquipment = new Set(["analytical_balance", "weighing_boat"]);
    const normalizeId = (value?: string) => (value ? value.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_") : "");
    const notThisStepMessage = "These equipments not necessary in this current step.";

    const enforceStepOneRestriction = (incomingId?: string) => {
      if (!isStepOne) return false;
      const normalized = normalizeId(incomingId);
      if (!incomingId || !allowedStepOneEquipment.has(normalized)) {
        showMessage(notThisStepMessage);
        return true;
      }
      return false;
    };

    let data: any = null;
    try {
      if (raw) {
        data = JSON.parse(raw);
      }
    } catch (err) {
      // raw wasn't JSON, handle common fallbacks below
      data = null;
    }

    // Helper to add a bottle (chemical)
    const addBottle = (payload: any) => {
      if (enforceStepOneRestriction(payload?.id)) {
        return;
      }
      setEquipmentPositions(prev => [
        ...prev,
        {
          id: `${payload.id || 'bottle'}_${Date.now()}`,
          x: x - 30,
          y: y - 30,
          isBottle: true,
          chemicals: [
            {
              id: payload.id,
              name: payload.name || payload.id,
              color: payload.color || "#87CEEB",
              amount: payload.amount || (payload.volume || 50),
              concentration: payload.concentration || "",
            }
          ],
        }
      ]);
    };

    // If data parsed as object, handle as before
    if (data && typeof data === 'object') {
      if (data.concentration || data.volume) {
        addBottle(data);
        return;
      }

      if (data.id && data.name) {
        if (enforceStepOneRestriction(data.id)) {
          return;
        }
        setEquipmentPositions(prev => [
        ...prev,
        {
          id: `${data.id}_${Date.now()}`,
          x: x - 50,
          y: y - 50,
          chemicals: [],
          typeId: data.id,
          name: data.name,
          imageSrc: data.imageSrc,
        }
      ]);
      // Notify parent that this equipment was placed so it can be removed from the palette
      if (onEquipmentPlaced) onEquipmentPlaced(data.id);
      return;
      }
    }

    // If raw is a URL (user dragged an image), create a generic equipment that displays the image
    if (raw && raw.startsWith("http")) {
      if (isStepOne) {
        showMessage(notThisStepMessage);
        return;
      }
      setEquipmentPositions(prev => [
        ...prev,
        {
          id: `image_${Date.now()}`,
          x: x - 60,
          y: y - 60,
          chemicals: [],
          name: 'Dropped Image',
          imageSrc: raw,
        }
      ]);
      return;
    }

    // If raw is a plain id string (e.g., "analytical_balance" or chemical id), try to resolve from props
    if (raw) {
      const trimmed = raw.trim();

      // Try equipment list first
      const eq = equipment.find(eqp => eqp.id === trimmed);
      if (eq) {
        if (enforceStepOneRestriction(eq.id)) {
          return;
        }
        setEquipmentPositions(prev => [
        ...prev,
        {
          id: `${eq.id}_${Date.now()}`,
          x: x - 50,
          y: y - 50,
          chemicals: [],
          typeId: eq.id,
          name: eq.name,
          imageSrc: undefined,
        }
      ]);
      // Notify parent that this equipment was placed (hide from palette)
      if (onEquipmentPlaced) onEquipmentPlaced(eq.id);
      return;
      }

      // Try chemicals list
      const chem = chemicals.find(c => c.id === trimmed);
      if (chem) {
        addBottle(chem);
        return;
      }
    }

    // Fallback: notify user or log
    if (isStepOne) {
      showMessage(notThisStepMessage);
    } else {
      console.warn('Unrecognized drop data:', raw);
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
        return "drag the oxalic acid dihydrate and spatula into the workspace";
      case 3:
        return "drag the oxalic acid dihydrate into the workspace and place it on the balance.";
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
            {step.id === 1 && (
              <p className="text-sm text-blue-700 font-medium mt-2">
                Drag the analytical balance and weighing boat into the workbench.
              </p>
            )}
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

        {workbenchMessage && (
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2 rounded-md">
            {workbenchMessage}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">

        {/* Workbench Area */}
        <div className="flex-1 flex flex-col">
          {/* Workbench Surface */}
          <div
            data-oxalic-workbench-surface="true"
            className={`flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 ${
              isDragOver ? "bg-blue-50 border-2 border-dashed border-blue-400" : ""
            } transform -translate-y-8`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Equipment on workbench */}
            {equipmentPositions.map((position) => {
              const equipmentData = equipment.find(eq =>
                position.typeId ? eq.id === position.typeId : position.id.startsWith(eq.id),
              );

              // If this position corresponds to a known equipment, render normally
              if (equipmentData) {
                // Show the provided analytical balance image when in step 1 of the Oxalic Acid preparation
                const balanceImageUrl = "https://cdn.builder.io/api/v1/image/assets%2F3c8edf2c5e3b436684f709f440180093%2F6430b7f56e744b15a955cffabccc28ab?format=webp&width=1200";
                const weighingBoatImageUrl = "https://cdn.builder.io/api/v1/image/assets%2F3c8edf2c5e3b436684f709f440180093%2Fe5172de4d6d44841bdba84ffd667286e?format=webp&width=800";
                const shouldShowBalanceImage = equipmentData.id === "analytical_balance";
                const shouldShowWeighingBoatImage = equipmentData.id === "weighing_boat";
                const imageSrc = position.imageSrc ?? (shouldShowBalanceImage
                  ? balanceImageUrl
                  : shouldShowWeighingBoatImage
                    ? weighingBoatImageUrl
                    : undefined);

                return (
                  <Equipment
                    key={position.id}
                    id={position.id}
                    typeId={equipmentData.id}
                    name={equipmentData.name}
                    icon={equipmentData.icon}
                    imageSrc={imageSrc}
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
                    typeId={chem.id}
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

              // If a custom image or name was added via a drop, render it
              if (position.imageSrc || position.name) {
                return (
                  <Equipment
                    key={position.id}
                    id={position.id}
                    name={position.name || "Dropped Item"}
                    icon={<span />}
                    imageSrc={position.imageSrc}
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

          {/* Measurements & Actions (moved from left panel) */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Measurements</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span>Target Mass:</span><span className="font-mono">{measurements.targetMass.toFixed(4)} g</span></div>
                  <div className="flex justify-between"><span>Weighed Mass:</span><span className="font-mono">{measurements.massWeighed.toFixed(4)} g</span></div>
                  <div className="flex justify-between"><span>Target Molarity:</span><span className="font-mono">{measurements.targetMolarity.toFixed(3)} M</span></div>
                  <div className="flex justify-between"><span>Actual Molarity:</span><span className="font-mono">{measurements.actualMolarity.toFixed(6)} M</span></div>
                  <div className="flex justify-between"><span>Temperature:</span><span className="font-mono">{temperature}°C</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Chemical Equation</h4>
                <div className="text-xs font-mono bg-gray-50 rounded-lg p-3 border text-center leading-relaxed">
                  <div>H₂C₂O₄·2H₂O (s) → H₂C₂O₄ (aq) + 2H₂O</div>
                  <div className="mt-1">H₂C₂O₄ (aq) ⇌ 2H⁺ + C₂O₄²⁻</div>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                {canProceed && (
                  <Button onClick={onStepAction} className="w-full mb-2" variant="default">
                    <FlaskConical className="w-4 h-4 mr-2" /> Complete Step {stepNumber}
                  </Button>
                )}
                <div className="space-y-2">
                  <Button onClick={onUndoStep} variant="outline" className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100" disabled={stepNumber <= 1}>
                    Undo Step {currentStepIndex}
                  </Button>
                  <Button onClick={onResetExperiment} variant="outline" className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100">Reset Experiment</Button>
                </div>
              </div>
            </div>
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
                  <div className="font-mono bg-gray-100 p-2 rounded">0.05 M</div>
                </div>
                <div>
                  <label className="font-medium">Volume (L):</label>
                  <div className="font-mono bg-gray-100 p-2 rounded">0.250 L</div>
                </div>
                <div>
                  <label className="font-medium">MW (g/mol):</label>
                  <div className="font-mono bg-gray-100 p-2 rounded">126.07</div>
                </div>
                <div>
                  <label className="font-medium">Mass (g):</label>
                  <div className="font-mono bg-blue-100 p-2 rounded font-bold">
                    {(0.05 * 0.25 * 126.07).toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Formula:</strong> m = M × V × MW</p>
                <p><strong>Calculation:</strong> {(0.05 * 0.25 * 126.07).toFixed(4)} g = 0.05 M × 0.250 L × 126.07 g/mol</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkBench;
