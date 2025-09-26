import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkBench } from "./WorkBench";
import { Equipment as PHEquipment } from "@/experiments/PHComparison/components/Equipment";
import { Beaker, Droplets, FlaskConical, Info, TestTube, Undo2, Wrench, CheckCircle } from "lucide-react";
import type { Experiment, ExperimentStep } from "@shared/schema";

interface VirtualLabProps {
  experiment: Experiment;
  experimentStarted: boolean;
  onStartExperiment: () => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  currentStep: number;
  onStepComplete: (stepId?: number) => void;
  onStepUndo?: (stepId?: number) => void;
  onReset: () => void;
  completedSteps: number[];
}

export default function VirtualLab({ experiment, experimentStarted, onStartExperiment, isRunning, setIsRunning, currentStep, onStepComplete, onStepUndo, onReset, completedSteps }: VirtualLabProps) {
  const totalSteps = experiment.stepDetails.length;
  const [equipmentOnBench, setEquipmentOnBench] = useState<Array<{ id: string; name: string; position: { x: number; y: number } }>>([]);

  useEffect(() => { setEquipmentOnBench([]); }, [experiment.id]);

  const items = useMemo(() => {
    const iconFor = (name: string) => {
      const key = name.toLowerCase();
      if (key.includes("test tube")) return <TestTube className="w-8 h-8" />;
      if (key.includes("dropper") || key.includes("pipette")) return <Droplets className="w-8 h-8" />;
      if (key.includes("indicator") || key.includes("meter")) return <FlaskConical className="w-8 h-8" />;
      return <Beaker className="w-8 h-8" />;
    };
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return experiment.equipment.map((name) => {
      const key = name.toLowerCase();
      const baseId = slug(name);
      const id = key.includes('test tube') ? 'test-tube' : baseId;
      return { id, name, icon: iconFor(name) };
    });
  }, [experiment.equipment]);

  const getPosition = (id: string) => {
    const idx = items.findIndex(i => i.id === id);
    const baseX = 220; // center column
    const baseY = 160;
    if (id === 'test-tube') {
      return { x: baseX, y: baseY + 140 };
    }
    return { x: baseX + ((idx % 2) * 160 - 80), y: baseY + Math.floor(idx / 2) * 140 };
  };

  const handleDrop = (id: string, _x: number, _y: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (!equipmentOnBench.find(e => e.id === id)) {
      setEquipmentOnBench(prev => [...prev, { id, name: item.name, position: getPosition(id) }]);
      if (!completedSteps.includes(currentStep)) onStepComplete(currentStep);
    }
  };

  const handleRemove = (id: string) => {
    setEquipmentOnBench(prev => prev.filter(e => e.id !== id));
    if (onStepUndo) onStepUndo();
  };

  const stepsProgress = (
    <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Experiment Progress</h3>
        <span className="text-sm text-blue-600 font-medium">Step {currentStep} of {totalSteps}</span>
      </div>
      <div className="flex space-x-2 mb-4">
        {experiment.stepDetails.map((step) => (
          <div key={step.id} className={`flex-1 h-2 rounded-full ${completedSteps.includes(step.id) ? 'bg-green-500' : currentStep === step.id ? 'bg-blue-500' : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completedSteps.includes(currentStep) ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
          {completedSteps.includes(currentStep) ? <CheckCircle className="w-4 h-4" /> : <span className="text-sm font-bold">{currentStep}</span>}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{experiment.stepDetails[currentStep-1]?.title}</h4>
          <p className="text-sm text-gray-600">{experiment.stepDetails[currentStep-1]?.description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="w-full h-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
        {stepsProgress}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-blue-600" />
                Equipment
              </h3>
              <div className="space-y-3">
                {items.map((eq) => (
                  <PHEquipment key={eq.id} id={eq.id} name={eq.name} icon={eq.icon} disabled={!experimentStarted} />
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700"><strong>Tip:</strong> Drag equipment to the workbench following the steps.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={() => { if (equipmentOnBench.length) { handleRemove(equipmentOnBench[equipmentOnBench.length-1].id); } }} variant="outline" className="w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center">
                <Undo2 className="w-4 h-4 mr-2" /> UNDO
              </Button>
              <Button onClick={() => { setEquipmentOnBench([]); onReset(); }} variant="outline" className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100">Reset Experiment</Button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <WorkBench onDrop={handleDrop} isRunning={isRunning} currentStep={currentStep} totalSteps={totalSteps}>
              {equipmentOnBench.map(e => (
                <PHEquipment key={e.id} id={e.id} name={e.name} icon={items.find(i => i.id === e.id)?.icon || <Beaker className="w-8 h-8" />} position={e.position} onRemove={handleRemove} />
              ))}
            </WorkBench>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-green-600" />
                Live Analysis
              </h3>
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Current Step</h4>
                <p className="text-xs text-gray-600">{experiment.stepDetails[currentStep-1]?.title}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Completed Steps</h4>
                <div className="space-y-1">
                  {experiment.stepDetails.map((step) => (
                    <div key={step.id} className={`flex items-center space-x-2 text-xs ${completedSteps.includes(step.id) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="w-3 h-3" />
                      <span>{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
