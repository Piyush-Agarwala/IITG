import React, { useState, useCallback, useEffect } from "react";
import { Equipment } from "./Equipment";
import { WorkBench } from "./WorkBench";
import { Chemical } from "./Chemical";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FlaskConical, Atom, BookOpen, List } from "lucide-react";
import {
  CHEMICAL_EQUILIBRIUM_CHEMICALS,
  CHEMICAL_EQUILIBRIUM_EQUIPMENT,
  DEFAULT_MEASUREMENTS,
} from "../constants";
import type {
  EquipmentPosition,
  CobaltReactionState,
  Measurements,
  Result,
  ExperimentStep,
} from "../types";

interface ChemicalEquilibriumVirtualLabProps {
  step: ExperimentStep;
  onStepComplete: () => void;
  isActive: boolean;
  stepNumber: number;
  totalSteps: number;
  experimentTitle: string;
  allSteps: ExperimentStep[];
  experimentStarted: boolean;
  onStartExperiment: () => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  onResetTimer: () => void;
}

function ChemicalEquilibriumVirtualLab({
  step,
  onStepComplete,
  isActive,
  stepNumber,
  totalSteps,
  experimentTitle,
  allSteps,
  experimentStarted,
  onStartExperiment,
  isRunning,
  setIsRunning,
  onResetTimer,
}: ChemicalEquilibriumVirtualLabProps) {
  const [equipmentPositions, setEquipmentPositions] = useState<
    EquipmentPosition[]
  >([]);
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [measurements, setMeasurements] =
    useState<Measurements>(DEFAULT_MEASUREMENTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(stepNumber);

  // Chemical Equilibrium specific states
  const [cobaltChlorideAdded, setCobaltChlorideAdded] = useState(false);
  const [distilledWaterAdded, setDistilledWaterAdded] = useState(false);
  const [stirrerActive, setStirrerActive] = useState(false);
  const [colorTransition, setColorTransition] = useState<
    "blue" | "transitioning" | "pink"
  >("pink");
  const [step3WaterAdded, setStep3WaterAdded] = useState(false);

  // Listen for automatic step completion events
  useEffect(() => {
    const handleStepComplete = (event: CustomEvent) => {
      if (event.detail?.nextStep === 5 && currentStep === 4) {
        setCurrentStep(5);
        onStepComplete();
        setToastMessage("Moving to Step 5...");
        setTimeout(() => setToastMessage(null), 3000);
      } else if (event.detail?.nextStep === 6 && currentStep === 5) {
        setCurrentStep(6);
        onStepComplete();
        setToastMessage("Solution turned pink! Moving to Step 6...");
        setTimeout(() => setToastMessage(null), 800);
      }
    };

    window.addEventListener(
      "stepComplete",
      handleStepComplete as EventListener,
    );

    return () => {
      window.removeEventListener(
        "stepComplete",
        handleStepComplete as EventListener,
      );
    };
  }, [currentStep, onStepComplete]);

  const cobaltReactionState: CobaltReactionState = {
    cobaltChlorideAdded,
    distilledWaterAdded,
    stirrerActive,
    colorTransition,
    step3WaterAdded,
  };

  const handleEquipmentDrop = useCallback(
    (id: string, x: number, y: number) => {
      setEquipmentPositions((prev) => {
        const existing = prev.find((pos) => pos.id === id);
        if (existing) {
          // Auto-alignment logic for Chemical Equilibrium
          if (id === "beaker_hot_water") {
            if (currentStep === 4) {
              setToastMessage("Drop the test tube into the hot water beaker!");
            }
          } else if (id === "beaker_cold_water") {
            if (currentStep === 5) {
              setToastMessage("Drop the test tube into the cold water beaker!");
            }

            const testTube = prev.find((pos) => pos.id === "test_tubes");
            if (testTube) {
              const distance = Math.sqrt(
                Math.pow(x - testTube.x, 2) + Math.pow(y - testTube.y, 2),
              );
              if (distance < 200) {
                return prev.map((pos) =>
                  pos.id === id
                    ? { ...pos, x: testTube.x, y: testTube.y + 35 }
                    : pos,
                );
              }
            }
          } else if (id === "test_tubes") {
            const hotWaterBeaker = prev.find(
              (pos) => pos.id === "beaker_hot_water",
            );
            const coldWaterBeaker = prev.find(
              (pos) => pos.id === "beaker_cold_water",
            );

            if (hotWaterBeaker) {
              const distance = Math.sqrt(
                Math.pow(x - hotWaterBeaker.x, 2) +
                  Math.pow(y - hotWaterBeaker.y, 2),
              );
              if (distance < 200) {
                if (currentStep === 4) {
                  setToastMessage(null);
                }
                return prev.map((pos) =>
                  pos.id === id
                    ? {
                        ...pos,
                        x: hotWaterBeaker.x,
                        y: hotWaterBeaker.y - 35,
                      }
                    : pos,
                );
              }
            }

            if (coldWaterBeaker && currentStep === 5) {
              const distance = Math.sqrt(
                Math.pow(x - coldWaterBeaker.x, 2) +
                  Math.pow(y - coldWaterBeaker.y, 2),
              );
              if (distance < 200) {
                setToastMessage(null);
                return prev.map((pos) =>
                  pos.id === id
                    ? {
                        ...pos,
                        x: coldWaterBeaker.x,
                        y: coldWaterBeaker.y - 35,
                      }
                    : pos,
                );
              }
            }
          }
          return prev.map((pos) => (pos.id === id ? { ...pos, x, y } : pos));
        }

        // Stirring rod automation for Chemical Equilibrium
        if (id === "stirring_rod" && distilledWaterAdded) {
          setStirrerActive(true);
          setToastMessage("Stirrer activated! Mixing solution...");
          setTimeout(() => setToastMessage(null), 3000);

          setTimeout(() => {
            setEquipmentPositions((prev) =>
              prev.filter((pos) => pos.id !== "stirring_rod"),
            );
            setToastMessage("Stirrer removed - mixing complete!");
            setTimeout(() => setToastMessage(null), 3000);
          }, 2000);

          setTimeout(() => {
            setColorTransition("transitioning");
            setToastMessage("Solution slowly turning pink...");
            setTimeout(() => setToastMessage(null), 3000);

            setTimeout(() => {
              setColorTransition("pink");
              setToastMessage("Pink hydrated cobalt complex formed!");
              setTimeout(() => setToastMessage(null), 4000);

              setTimeout(() => {
                onStepComplete();
                setCurrentStep(currentStep + 1);
                setToastMessage("Step completed! Moving to next step...");
                setTimeout(() => setToastMessage(null), 3000);
              }, 1000);
            }, 2000);
          }, 1000);
        }

        return [...prev, { id, x, y, chemicals: [] }];
      });
    },
    [currentStep, distilledWaterAdded, onStepComplete],
  );

  const handleEquipmentRemove = useCallback((id: string) => {
    setEquipmentPositions((prev) => prev.filter((pos) => pos.id !== id));
    setToastMessage("Equipment removed from workbench");
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  const handleChemicalSelect = (id: string) => {
    setSelectedChemical(selectedChemical === id ? null : id);
  };

  const handleChemicalDrop = (
    chemicalId: string,
    equipmentId: string,
    amount: number,
  ) => {
    const chemical = CHEMICAL_EQUILIBRIUM_CHEMICALS.find(
      (c) => c.id === chemicalId,
    );
    if (!chemical) return;

    setEquipmentPositions((prev) =>
      prev.map((pos) => {
        if (pos.id === equipmentId) {
          const newChemicals = [
            ...pos.chemicals,
            {
              id: chemicalId,
              name: chemical.name,
              color: chemical.color,
              amount,
              concentration: chemical.concentration,
            },
          ];

          // Chemical Equilibrium reaction logic
          if (equipmentId === "test_tubes") {
            if (chemicalId === "cocl2") {
              setCobaltChlorideAdded(true);
              setToastMessage(
                "Blue cobalt chloride crystals formed in test tube!",
              );
              setTimeout(() => setToastMessage(null), 3000);
            } else if (chemicalId === "water" && cobaltChlorideAdded) {
              setDistilledWaterAdded(true);

              if (currentStep === 3) {
                setStep3WaterAdded(true);
                setToastMessage(
                  "Color changing back to pink as the equilibrium shifts in the reverse direction!",
                );
                setTimeout(() => {
                  setToastMessage(null);
                  setCurrentStep(4);
                  onStepComplete();
                }, 3000);
              } else {
                setToastMessage("Add the stirrer");
                setTimeout(() => setToastMessage(null), 5000);
              }
            } else if (
              chemicalId === "hcl_conc" &&
              cobaltChlorideAdded &&
              distilledWaterAdded
            ) {
              setToastMessage(
                "Color changed from pink to blue as the equilibrium changed!",
              );
              setTimeout(() => {
                setToastMessage(null);
                setCurrentStep(3);
                setToastMessage("Moving to the next step...");
                setTimeout(() => setToastMessage(null), 3000);
              }, 2000);
            } else {
              setToastMessage(
                `Added ${amount}mL of ${chemical.name} to ${equipmentId}`,
              );
              setTimeout(() => setToastMessage(null), 3000);
            }
          } else {
            setToastMessage(
              `Added ${amount}mL of ${chemical.name} to ${equipmentId}`,
            );
            setTimeout(() => setToastMessage(null), 3000);
          }

          return { ...pos, chemicals: newChemicals };
        }
        return pos;
      }),
    );

    setSelectedChemical(null);
  };

  const handleStartExperiment = () => {
    onStartExperiment();
  };

  const handleReset = () => {
    setEquipmentPositions([]);
    setSelectedChemical(null);
    setIsRunning(false);
    setResults([]);
    setCurrentStep(stepNumber);
    setMeasurements(DEFAULT_MEASUREMENTS);
    setToastMessage(null);
    setCobaltChlorideAdded(false);
    setDistilledWaterAdded(false);
    setStirrerActive(false);
    setColorTransition("pink");
    setStep3WaterAdded(false);
    onResetTimer();
  };

  return (
    <TooltipProvider>
      <div
        className="w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden flex"
        style={{ minHeight: "75vh" }}
      >
        {/* Main Lab Content */}
        <div className="flex-1 flex flex-col">
          {/* Equipment Bar - Top Horizontal */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h4 className="font-semibold text-gray-800 text-sm flex items-center">
                  <Atom className="w-4 h-4 mr-2 text-blue-600" />
                  Chemical Equilibrium - Equipment
                </h4>
                <span className="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
                  STEP {currentStep}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-2 overflow-x-auto pb-2">
              {CHEMICAL_EQUILIBRIUM_EQUIPMENT.map((equipment) => (
                <div key={equipment.id} className="flex-shrink-0">
                  <Equipment
                    id={equipment.id}
                    name={equipment.name}
                    icon={equipment.icon}
                    onDrag={experimentStarted ? handleEquipmentDrop : () => {}}
                    position={null}
                    chemicals={[]}
                    onChemicalDrop={
                      experimentStarted ? handleChemicalDrop : () => {}
                    }
                    allEquipmentPositions={equipmentPositions}
                    currentStep={currentStep}
                    disabled={!experimentStarted}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Main Work Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 relative">
              <WorkBench
                onDrop={experimentStarted ? handleEquipmentDrop : () => {}}
                selectedChemical={experimentStarted ? selectedChemical : null}
                isRunning={isRunning}
                experimentTitle={experimentTitle}
              >
                {equipmentPositions.map((pos) => {
                  const equipment = CHEMICAL_EQUILIBRIUM_EQUIPMENT.find(
                    (eq) => eq.id === pos.id,
                  );
                  return equipment ? (
                    <Equipment
                      key={pos.id}
                      id={pos.id}
                      name={equipment.name}
                      icon={equipment.icon}
                      onDrag={
                        experimentStarted ? handleEquipmentDrop : () => {}
                      }
                      position={pos}
                      chemicals={pos.chemicals}
                      onChemicalDrop={
                        experimentStarted ? handleChemicalDrop : () => {}
                      }
                      onRemove={
                        experimentStarted ? handleEquipmentRemove : () => {}
                      }
                      cobaltReactionState={cobaltReactionState}
                      allEquipmentPositions={equipmentPositions}
                      currentStep={currentStep}
                      disabled={!experimentStarted}
                    />
                  ) : null;
                })}
              </WorkBench>
            </div>
          </div>

          {/* Reagents Bar - Bottom Horizontal */}
          <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3">
            <h4 className="font-semibold text-gray-800 text-sm flex items-center mb-2">
              <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
              Chemical Reagents
            </h4>
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {CHEMICAL_EQUILIBRIUM_CHEMICALS.map((chemical) => (
                <div key={chemical.id} className="flex-shrink-0">
                  <Chemical
                    id={chemical.id}
                    name={chemical.name}
                    formula={chemical.formula}
                    color={chemical.color}
                    concentration={chemical.concentration}
                    volume={chemical.volume}
                    onSelect={
                      experimentStarted ? handleChemicalSelect : () => {}
                    }
                    selected={
                      experimentStarted && selectedChemical === chemical.id
                    }
                    disabled={!experimentStarted}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default ChemicalEquilibriumVirtualLab;
