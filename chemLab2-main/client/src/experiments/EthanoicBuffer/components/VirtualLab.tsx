import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkBench } from "./WorkBench";
import { Equipment as PHEquipment } from "@/experiments/PHComparison/components/Equipment";
import { Beaker, Droplets, FlaskConical, Info, TestTube, Undo2, Wrench, CheckCircle } from "lucide-react";
import type { Experiment, ExperimentStep } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  // Test tube visual state
  const [testTubeVolume, setTestTubeVolume] = useState(0);
  const [testTubeColor, setTestTubeColor] = useState<string | undefined>(undefined);

  // Track moles of acid (HA) and conjugate base (A-)
  const [acidMoles, setAcidMoles] = useState(0);
  const [sodiumMoles, setSodiumMoles] = useState(0);
  const [lastMeasuredPH, setLastMeasuredPH] = useState<number | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const [showAceticDialog, setShowAceticDialog] = useState(false);
  const [aceticVolume, setAceticVolume] = useState("10.0");
  const [aceticError, setAceticError] = useState<string | null>(null);
  const [showSodiumDialog, setShowSodiumDialog] = useState(false);
  const [sodiumVolume, setSodiumVolume] = useState("5.0");
  const [sodiumError, setSodiumError] = useState<string | null>(null);

  useEffect(() => { setEquipmentOnBench([]); setAcidMoles(0); setSodiumMoles(0); setLastMeasuredPH(null); setShowToast(null); }, [experiment.id]);

  const items = useMemo(() => {
    const iconFor = (name: string) => {
      const key = name.toLowerCase();
      if (key.includes("test tube")) return <TestTube className="w-8 h-8" />;
      if (key.includes("dropper") || key.includes("pipette")) return <Droplets className="w-8 h-8" />;
      if (key.includes("indicator") || key.includes("meter")) return <FlaskConical className="w-8 h-8" />;
      return <Beaker className="w-8 h-8" />;
    };
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Build in server-provided order first
    const raw = experiment.equipment.map((name) => {
      const key = name.toLowerCase();
      const baseId = slug(name);
      const id = key.includes('test tube') ? 'test-tube' : baseId;
      return { id, name, icon: iconFor(name) };
    });

    // Reorder so that Test Tube is first, then Ethanoic Acid and Sodium Ethanoate
    const isEthanoic = (n: string) => /ethanoic|acetic/i.test(n);
    const isSodiumEthanoate = (n: string) => /sodium\s*ethanoate|sodium\s*acetate/i.test(n);

    const testTube = raw.find(i => i.id === 'test-tube' || /test\s*tube/i.test(i.name));
    const ethanoic = raw.find(i => isEthanoic(i.name));
    const sodium = raw.find(i => isSodiumEthanoate(i.name));
    const others = raw.filter(i => i !== testTube && i !== ethanoic && i !== sodium);

    return [testTube, ethanoic, sodium, ...others].filter(Boolean) as typeof raw;
  }, [experiment.equipment]);

  const getPosition = (id: string) => {
    const idx = items.findIndex(i => i.id === id);
    const baseX = 220; // center column
    const baseY = 160;
    if (id === 'test-tube') {
      return { x: baseX, y: baseY + 140 };
    }

    // place the pH paper / universal indicator directly below the test tube and make it fixed
    if (id === 'universal-indicator' || id.toLowerCase().includes('ph')) {
      // align horizontally with the test-tube and position slightly further below it (lowered)
      return { x: baseX, y: baseY + 330 };
    }

    return { x: baseX + ((idx % 2) * 160 - 80), y: baseY + Math.floor(idx / 2) * 140 };
  };

  const handleDrop = (id: string, x: number, y: number, action: 'new' | 'move' = 'new') => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (action === 'move') {
      // do not allow moving fixed items (e.g., pH paper or fixed reagent bottles)
      setEquipmentOnBench(prev => prev.map(e => e.id === id ? ((e.position as any)?.fixed ? e : { ...e, position: { x, y } }) : e));
      return;
    }

    // add new equipment at the exact drop coordinates
    if (!equipmentOnBench.find(e => e.id === id)) {
      // treat pH paper / universal indicator as fixed and always place it at the designated position
      const isFixedReagent = /ethanoic|acetic|sodium-ethanoate|sodium_ethanoate|sodium ethanoate|sodium acetate/i.test(item.name);
      const isPhPaper = id === 'universal-indicator' || item.name.toLowerCase().includes('ph') || id.toLowerCase().includes('ph');

      let positionObj: any;
      if (isPhPaper) {
        // use the canonical getPosition to compute the exact fixed coordinates
        const pos = getPosition(id);
        positionObj = { x: pos.x, y: pos.y, fixed: true };
      } else if (isFixedReagent) {
        positionObj = { x, y, fixed: true };
      } else {
        positionObj = { x, y };
      }

      setEquipmentOnBench(prev => [...prev, { id, name: id === 'test-tube' ? '20 mL Test Tube' : item.name, position: positionObj }]);
      // Only mark the step complete for interactive actions (not when placing fixed reagent bottles)
      if (!positionObj.fixed && !completedSteps.includes(currentStep)) onStepComplete(currentStep);
    }
  };

  const handleRemove = (id: string) => {
    setEquipmentOnBench(prev => prev.filter(e => e.id !== id));
    if (onStepUndo) onStepUndo();
  };

  const handleInteract = (id: string) => {
  const idLower = id.toLowerCase();
  if (idLower.includes('ethanoic') || idLower.includes('acetic')) {
    setShowAceticDialog(true);
    return;
  }
  if (idLower.includes('sodium') || idLower.includes('ethanoate') || idLower.includes('acetate')) {
    setShowSodiumDialog(true);
    return;
  }
};

const confirmAddAcetic = () => {
  const v = parseFloat(aceticVolume);
  if (Number.isNaN(v) || v < 10.0 || v > 15.0) {
    setAceticError('Please enter a value between 10.0 and 15.0 mL');
    return;
  }
  // Update visual: add liquid to the test tube and track moles
  setTestTubeVolume(prev => Math.max(0, Math.min(20, prev + v)));
  // semi-transparent light-blue color
  setTestTubeColor('rgba(173,216,230,0.6)');

  // compute moles: 0.1 M * volume(L)
  const vL = v / 1000;
  const moles = 0.1 * vL;
  setAcidMoles(prev => prev + moles);

  // mark the step complete when the user confirms adding the acetic volume
  if (!completedSteps.includes(currentStep)) onStepComplete(currentStep);
  setShowAceticDialog(false);
  setAceticError(null);
  setShowToast(`Added ${v.toFixed(1)} mL of 0.1 M ethanoic acid`);
  setTimeout(() => setShowToast(null), 2000);
};

const confirmAddSodium = () => {
  const v = parseFloat(sodiumVolume);
  if (Number.isNaN(v) || v < 1.0 || v > 20.0) {
    setSodiumError('Please enter a value between 1.0 and 20.0 mL');
    return;
  }
  // update volume and moles for sodium ethanoate
  setTestTubeVolume(prev => Math.max(0, Math.min(20, prev + v)));
  const vL = v / 1000;
  const moles = 0.1 * vL;
  setSodiumMoles(prev => prev + moles);

  // mark the step complete when the user confirms adding the sodium ethanoate volume
  if (!completedSteps.includes(currentStep)) onStepComplete(currentStep);
  setShowSodiumDialog(false);
  setSodiumError(null);
  setShowToast(`Added ${v.toFixed(1)} mL of 0.1 M sodium ethanoate`);
  setTimeout(() => setShowToast(null), 2000);
};

// Measure pH using Henderson-Hasselbalch when both species exist, fallback to simple rules
const testPH = () => {
  const totalVolL = Math.max(1e-6, testTubeVolume / 1000);
  if (testTubeVolume <= 0) {
    setShowToast('No solution in test tube');
    setTimeout(() => setShowToast(null), 1400);
    return;
  }

  const pKa = 4.76;
  let ph: number | null = null;

  const HA = Math.max(0, acidMoles);
  const A = Math.max(0, sodiumMoles);

  if (HA > 0 && A > 0) {
    const concHA = HA / totalVolL;
    const concA = A / totalVolL;
    ph = pKa + Math.log10(concA / concHA);
  } else if (HA > 0 && A === 0) {
    // approximate pH of weak acid (very rough) using pH = 1/2(pKa - log C)
    const C = HA / totalVolL;
    ph = 0.5 * (pKa - Math.log10(C));
  } else if (A > 0 && HA === 0) {
    // basic solution (conjugate base only)
    ph = 8.5; // indicate basic (approx)
  }

  if (ph === null || Number.isNaN(ph) || !isFinite(ph)) {
    setShowToast('pH measurement inconclusive');
    setTimeout(() => setShowToast(null), 1400);
    return;
  }

  const rounded = Math.max(0, Math.min(14, ph));
  setLastMeasuredPH(rounded);
  setShowToast(`Measured pH ≈ ${rounded.toFixed(2)}`);
  setTimeout(() => setShowToast(null), 2000);

  // Update pH paper color based on pH (do NOT change test tube color)
  let paperColor: string | undefined = undefined;
  if (rounded < 4.5) paperColor = '#ff6b6b'; // acidic - red
  else if (rounded < 6.5) paperColor = '#ffb74d'; // weak acidic - orange
  else if (rounded < 8) paperColor = '#C8E6C9'; // near neutral - green
  else paperColor = '#64b5f6'; // basic - blue

  // tint pH paper on the bench if present
  setEquipmentOnBench(prev => prev.map(e => {
    if (e.id === 'universal-indicator' || e.id.toLowerCase().includes('ph')) {
      return { ...e, color: paperColor } as any;
    }
    return e;
  }));

  // Auto-complete relevant steps: initial measure (3) and observe pH change (5)
  if (currentStep === 3 || currentStep === 5) {
    if (!completedSteps.includes(currentStep)) onStepComplete(currentStep);
  }
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
                  <PHEquipment key={eq.id} id={eq.id} name={eq.id === 'test-tube' ? '20 mL Test Tube' : eq.name} icon={eq.icon} disabled={!experimentStarted} onInteract={handleInteract} />
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
                <PHEquipment
                  key={e.id}
                  id={e.id}
                  name={e.name}
                  icon={items.find(i => i.id === e.id)?.icon || <Beaker className="w-8 h-8" />}
                  position={e.position}
                  onRemove={handleRemove}
                  onInteract={handleInteract}
                  // show test tube volume/color when available, or pass pH paper color if present
                  {...(e.id === 'test-tube' ? { volume: testTubeVolume, color: testTubeColor } : (e.color ? { color: (e as any).color } : {}))}
                />
              ))}

              {/* Contextual MEASURE action near pH paper when present */}
              {equipmentOnBench.find(e => e.id === 'universal-indicator' || e.id.toLowerCase().includes('ph')) && (
                (() => {
                  const phItem = equipmentOnBench.find(e => e.id === 'universal-indicator' || e.id.toLowerCase().includes('ph'))!;
                  return (
                    <div key="measure-button" style={{ position: 'absolute', left: phItem.position.x, top: phItem.position.y + 40, transform: 'translate(-50%, 0)' }}>
                      <Button size="sm" className={`bg-amber-600 text-white hover:bg-amber-700 shadow-sm ${lastMeasuredPH === null ? 'animate-pulse' : ''}`} onClick={testPH}>MEASURE</Button>
                    </div>
                  );
                })()
              )}

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

              {/* Measured pH */}
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Measured pH</h4>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const display = lastMeasuredPH != null ? `${lastMeasuredPH.toFixed(2)} to ${lastMeasuredPH.toFixed(1)}` : '--';
                    return (
                      <>
                        <div className="text-2xl font-bold text-purple-700">{display}</div>
                        <div className="text-xs text-gray-500">{lastMeasuredPH != null ? (lastMeasuredPH < 7 ? 'Acidic' : lastMeasuredPH > 7 ? 'Basic' : 'Neutral') : 'No measurement yet'}</div>
                      </>
                    );
                  })()}
                </div>
                {showToast && <p className="text-xs text-blue-700 mt-2">{showToast}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    {/* Volume dialog for 0.1 M Ethanoic (Acetic) Acid */}
      <Dialog open={showAceticDialog} onOpenChange={setShowAceticDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Volume</DialogTitle>
            <DialogDescription>
              Enter the volume of 0.1 M CH3COOH to add to the test tube.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Volume (mL)</label>
            <input
              type="number"
              step="0.1"
              min={10.0}
              max={15.0}
              value={aceticVolume}
              onChange={(e) => {
                const val = e.target.value;
                setAceticVolume(val);
                const parsed = parseFloat(val);
                if (Number.isNaN(parsed) || parsed < 10.0 || parsed > 15.0) {
                  setAceticError("Please enter a value between 10.0 and 15.0 mL");
                } else {
                  setAceticError(null);
                }
              }}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter volume in mL"
            />
            {aceticError && <p className="text-xs text-red-600">{aceticError}</p>}
            <p className="text-xs text-gray-500">Recommended range: 10.0 – 15.0 mL</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAceticDialog(false)}>Cancel</Button>
            <Button onClick={confirmAddAcetic} disabled={!!aceticError || Number.isNaN(parseFloat(aceticVolume)) || parseFloat(aceticVolume) < 10.0 || parseFloat(aceticVolume) > 15.0}>Add Solution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Volume dialog for 0.1 M Sodium Ethanoate (Sodium Acetate) */}
      <Dialog open={showSodiumDialog} onOpenChange={setShowSodiumDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Volume</DialogTitle>
            <DialogDescription>
              Enter the volume of 0.1 M Sodium Ethanoate (Sodium Acetate) to add to the test tube.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Volume (mL)</label>
            <input
              type="number"
              step="0.1"
              min={1.0}
              max={20.0}
              value={sodiumVolume}
              onChange={(e) => {
                const val = e.target.value;
                setSodiumVolume(val);
                const parsed = parseFloat(val);
                if (Number.isNaN(parsed) || parsed < 1.0 || parsed > 20.0) {
                  setSodiumError("Please enter a value between 1.0 and 20.0 mL");
                } else {
                  setSodiumError(null);
                }
              }}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter volume in mL"
            />
            {sodiumError && <p className="text-xs text-red-600">{sodiumError}</p>}
            <p className="text-xs text-gray-500">Recommended range: 1.0 – 20.0 mL</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSodiumDialog(false)}>Cancel</Button>
            <Button onClick={confirmAddSodium} disabled={!!sodiumError || Number.isNaN(parseFloat(sodiumVolume)) || parseFloat(sodiumVolume) < 1.0 || parseFloat(sodiumVolume) > 20.0}>Add Solution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
