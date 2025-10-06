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
  onStepAction: (opts?: { skipAnimation?: boolean }) => void;
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
  // amount of oxalic acid (g) the user wants to add into the weighing boat during step 3
  // keep this completely under user control (do not auto-sync with calculated targetMass)
  const [acidAmount, setAcidAmount] = useState<string>("");
  // pouring animation state when adding acid into the weighing boat
  const [pouring, setPouring] = useState<{ boatId: string; x: number; y: number; active: boolean } | null>(null);
  const [washAnimation, setWashAnimation] = useState<{ x: number; y: number; active: boolean } | null>(null);
  const pourTimeoutRef = useRef<number | null>(null);

  // messages shown on the workbench area (transient)
  const [workbenchMessage, setWorkbenchMessage] = useState<string | null>(null);
  const [workbenchMessageVariant, setWorkbenchMessageVariant] = useState<'default' | 'colorful' | null>(null);
  const messageTimeoutRef = useRef<number | null>(null);

  const showMessage = useCallback((text: string, variant: 'default' | 'colorful' = 'default') => {
    setWorkbenchMessage(text);
    setWorkbenchMessageVariant(variant);
    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = window.setTimeout(() => {
      setWorkbenchMessage(null);
      setWorkbenchMessageVariant(null);
      messageTimeoutRef.current = null;
    }, 8000);
  }, []);

  // Cleanup for timeouts on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
      if (pourTimeoutRef.current) {
        window.clearTimeout(pourTimeoutRef.current);
        pourTimeoutRef.current = null;
      }
    };
  }, []);

  // show a colorful hint for first-time users; persist dismissal in localStorage
  const [showAcidHint, setShowAcidHint] = useState<boolean>(false);
  useEffect(() => {
    try {
      const seen = localStorage.getItem('seenAcidControl');
      setShowAcidHint(!seen);
    } catch (e) {
      setShowAcidHint(false);
    }
  }, []);
  const dismissAcidHint = () => {
    try { localStorage.setItem('seenAcidControl', '1'); } catch (e) {}
    setShowAcidHint(false);
  };

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
      if (pourTimeoutRef.current) {
        window.clearTimeout(pourTimeoutRef.current);
        pourTimeoutRef.current = null;
      }
    };
  }, []);

  // Listen for global reminder events triggered by equipment components
  useEffect(() => {
    const handler = () => {
      showMessage("Before adding the amount of acid into the boat make sure you open the calculator once!");
    };
    window.addEventListener("oxalicCalculatorReminder", handler as EventListener);
    return () => {
      window.removeEventListener("oxalicCalculatorReminder", handler as EventListener);
    };
  }, [showMessage]);

  // Listen for programmatic distilled water additions from the chemical palette
  useEffect(() => {
    const addWaterHandler = (e: any) => {
      try {
        const detail = e?.detail || {};
        const amount = Number(detail.amount) || 100;

        // Find a beaker on the workbench
        const beakers = equipmentPositions.filter(p => ((p.typeId ?? p.id) + '').toLowerCase().includes('beaker'));
        if (beakers.length === 0) {
          showMessage('Place a beaker on the workbench to add distilled water.', 'colorful');
          return;
        }

        // Choose the first beaker (nearest could be implemented later)
        const target = beakers[0];

        // Compute animation position using DOM if available
        const surfaceEl = (document.querySelector('[data-oxalic-workbench-surface="true"]') as HTMLElement) || null;
        let animX = (target.x || 0) + 20;
        let animY = (target.y || 0) - 60;
        if (surfaceEl) {
          const beakerEl = surfaceEl.querySelector(`[data-equipment-id="${target.id}"]`) as HTMLElement | null;
          const surfaceRect = surfaceEl.getBoundingClientRect();
          if (beakerEl) {
            const beakerRect = beakerEl.getBoundingClientRect();
            animX = beakerRect.left - surfaceRect.left + beakerRect.width * 0.6;
            animY = beakerRect.top - surfaceRect.top - Math.max(40, beakerRect.height * 0.6);
          }
        }

        // Show a colorful hint telling the user where to add distilled water from
        showMessage(`Adding ${amount} mL distilled water into the beaker. Use the wash bottle or the Distilled Water bottle on the left.`, 'colorful');

        // Start a brief wash-like animation above the beaker
        setWashAnimation({ x: animX, y: animY, active: true });

        // After animation completes, actually add the water to the beaker's chemicals array
        window.setTimeout(() => {
          setEquipmentPositions(prev => prev.map(pos => {
            if (pos.id === target.id) {
              return {
                ...pos,
                chemicals: [
                  ...pos.chemicals,
                  {
                    id: 'distilled_water',
                    name: 'Distilled Water',
                    color: '#87CEEB',
                    amount: amount,
                    concentration: 'Pure'
                  }
                ]
              };
            }
            return pos;
          }));

          // stop animation and show confirmation
          setWashAnimation(null);
          showMessage(`${amount} mL distilled water added to the beaker.`);
        }, 1600);
      } catch (err) {
        console.warn('addDistilledWater handler error', err);
      }
    };

    window.addEventListener('addDistilledWater', addWaterHandler as EventListener);
    return () => window.removeEventListener('addDistilledWater', addWaterHandler as EventListener);
  }, [equipmentPositions, setEquipmentPositions, showMessage]);

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

    // support multiple drag data formats for robustness
    const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("equipment") || e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/uri-list") || "";
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
      const newPosId = `${payload.id || 'bottle'}_${Date.now()}`;
      setEquipmentPositions(prev => [
        ...prev,
        {
          id: newPosId,
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
      // small delay then align beaker & wash bottle for step 4
      setTimeout(() => alignBeakerAndWash(true), 60);

      // Notify parent that this chemical bottle was placed so the chemical can be removed from the palette
      try {
        if (onEquipmentPlaced && payload && payload.id) {
          onEquipmentPlaced(payload.id);
        }
      } catch {}

      // If oxalic acid bottle was added during quantitative analysis step, show reminder and dispatch event
      try {
        if (payload && payload.id === 'oxalic_acid' && step.id === 3) {
          showMessage('Click the calculator once to see the amount of acid required');
          try { window.dispatchEvent(new CustomEvent('oxalicCalculatorReminder')); } catch {}
        }
      } catch {}
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
          imageSrc: (step.id === 4 && (data.id === 'volumetric_flask' || (data.name || '').toLowerCase().includes('volumetric flask')))
            ? 'https://cdn.builder.io/api/v1/image/assets%2F3c8edf2c5e3b436684f709f440180093%2F1782add6aa7c40cc992b82016876895e?format=webp&width=800'
            : data.imageSrc,
        }
      ]);
      setTimeout(() => alignBeakerAndWash(true), 60);
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
      setTimeout(() => alignBeakerAndWash(true), 60);
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
          imageSrc: (step.id === 4 && eq.id === 'volumetric_flask')
            ? 'https://cdn.builder.io/api/v1/image/assets%2F3c8edf2c5e3b436684f709f440180093%2F1782add6aa7c40cc992b82016876895e?format=webp&width=800'
            : undefined,
        }
      ]);
      setTimeout(() => alignBeakerAndWash(true), 60);
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

  const handleEquipmentAction = (action: string, equipmentId?: string) => {
    switch (action) {
      case "weigh":
      case "stir":
      case "adjust_volume":
        onStepAction();
        break;
      case "rinse": {
        if (!equipmentId) {
          showMessage('No wash bottle selected.');
          return;
        }
        const bottle = equipmentPositions.find(p => p.id === equipmentId);
        if (!bottle) {
          showMessage('Wash bottle is not on the workbench.');
          return;
        }

        // Find nearest beaker
        const beakers = equipmentPositions.filter(p => ((p.typeId ?? p.id) + '').toLowerCase().includes('beaker'));
        if (beakers.length === 0) {
          showMessage('Place a beaker on the workbench to rinse.');
          return;
        }
        let nearest = beakers[0];
        let minDist = Number.POSITIVE_INFINITY;
        beakers.forEach(b => {
          const dx = (b.x || 0) - (bottle.x || 0);
          const dy = (b.y || 0) - (bottle.y || 0);
          const d = Math.hypot(dx, dy);
          if (d < minDist) { minDist = d; nearest = b; }
        });

        // Compute wash animation position using actual DOM bounding rect so the stream is over the beaker
        const surfaceEl = (document.querySelector('[data-oxalic-workbench-surface="true"]') as HTMLElement) || null;
        let animX = (nearest.x || 0) + 20;
        let animY = (nearest.y || 0) - 60;
        if (surfaceEl) {
          const beakerEl = surfaceEl.querySelector(`[data-equipment-id="${nearest.id}"]`) as HTMLElement | null;
          const surfaceRect = surfaceEl.getBoundingClientRect();
          if (beakerEl) {
            const beakerRect = beakerEl.getBoundingClientRect();
            animX = beakerRect.left - surfaceRect.left + beakerRect.width * 0.6;
            animY = beakerRect.top - surfaceRect.top - Math.max(40, beakerRect.height * 0.6);
          }
        }

        // Start visual rinse animation positioned above the beaker
        setWashAnimation({ x: animX, y: animY, active: true });
        showMessage('Rinsing the beaker...');

        // After animation completes, clear chemicals in the beaker visually and remove the wash bottle for step 4
        window.setTimeout(() => {
          setEquipmentPositions(prev => prev.map(pos => pos.id === nearest.id ? { ...pos, chemicals: [] } : pos));
          setWashAnimation(null);
          try {
            if (step.id === 4) {
              // remove the wash bottle used for rinsing from the workbench
              setEquipmentPositions(prev => prev.filter(pos => pos.id !== bottle.id));
              // automatically trigger the step action for step 4 (transfer to flask)
              try { if (typeof onStepAction === 'function') onStepAction({ skipAnimation: true }); } catch (e) {}
            }
          } catch (e) {}
          showMessage('Beaker rinsed.');
        }, 2200);

        break;
      }
    }
  };

  // Auto-align beaker and wash bottle when step 4 is active and both are present
  const washAlignRef = useRef(false);
  useEffect(() => {
    if (step.id !== 4) {
      washAlignRef.current = false;
      return;
    }

    const normalize = (value?: string) => (value ? value.toString().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_") : "");
    const beaker = equipmentPositions.find(p => normalize(p.typeId ?? p.id).includes('beaker'));
    const wash = equipmentPositions.find(p => normalize(p.typeId ?? p.id).includes('wash') || (p.typeId ?? p.id).toString().includes('wash_bottle') || (p.typeId ?? p.id).toString().includes('wash-bottle'));

    if (!beaker || !wash) {
      washAlignRef.current = false;
      return;
    }

    // Avoid re-aligning repeatedly
    if (washAlignRef.current) return;

    const surface = document.querySelector('[data-oxalic-workbench-surface="true"]') as HTMLElement | null;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();

    // If volumetric flask is present, align to match reference: beaker left/center, wash bottle slightly to its right and higher
    const flask = equipmentPositions.find(p => normalize(p.typeId ?? p.id).includes('volumetric_flask') || (p.typeId ?? p.id).toString().toLowerCase().includes('volumetric_flask'));

    let targetBeakerX: number;
    let targetBeakerY: number;
    let targetWashX: number;
    let targetWashY: number;

    if (flask) {
      // place beaker slightly left-of-center, a bit lower to appear on the bench
      targetBeakerX = Math.max(16, Math.floor(rect.width * 0.42));
      targetBeakerY = Math.max(12, Math.floor(rect.height * 0.36));
      // wash bottle a little to the right and slightly higher so the spout overlaps the beaker rim naturally
      targetWashX = Math.min(rect.width - 60, targetBeakerX + 28);
      targetWashY = Math.max(2, targetBeakerY - 28);

      // place flask to the right of wash bottle if possible (slightly lower to keep composition)
      const targetFlaskX = Math.min(rect.width - 80, targetWashX + 110);
      const targetFlaskY = Math.min(rect.height - 80, targetBeakerY + 6);

      // apply flask position immediately to keep spacing
      setEquipmentPositions(prev => prev.map(pos => {
        if (pos.id === flask.id) return { ...pos, x: targetFlaskX, y: targetFlaskY };
        return pos;
      }));
    } else {
      // Default target: beaker slightly left of center, wash bottle above-right of beaker
      targetBeakerX = Math.max(16, Math.floor(rect.width * 0.35));
      targetBeakerY = Math.max(16, Math.floor(rect.height * 0.44));
      targetWashX = Math.min(rect.width - 60, targetBeakerX + 80);
      targetWashY = Math.max(8, targetBeakerY - 64);
    }

    // Avoid overlapping existing weighing boat(s). If a weighing boat is present near targets, shift beaker down below the boat
    const boats = equipmentPositions.filter(p => (normalize(p.typeId ?? p.id).includes('weighing_boat') || (p.typeId ?? p.id).toString().toLowerCase().includes('weighing_boat')) && typeof p.x === 'number' && typeof p.y === 'number' && isFinite(p.x) && isFinite(p.y) && (p.x > 8 || p.y > 8));

    const isOverlapping = (x1: number, y1: number, x2: number, y2: number, threshold = 60) => {
      return Math.hypot(x1 - x2, y1 - y2) < threshold;
    };

    if (boats.length > 0) {
      const boat = boats[0];
      // if default beaker pos would land on/near the boat, move beaker below the boat
      if (isOverlapping(targetBeakerX, targetBeakerY, boat.x || 0, boat.y || 0, 80)) {
        targetBeakerX = Math.max(16, (boat.x || 0) - 20);
        targetBeakerY = (boat.y || 0) + 90; // place below
        // ensure within surface
        targetBeakerX = Math.min(rect.width - 80, targetBeakerX);
        targetBeakerY = Math.min(rect.height - 80, targetBeakerY);
        // wash bottle should go to beaker's top-right
        targetWashX = Math.min(rect.width - 60, targetBeakerX + 80);
        targetWashY = Math.max(8, targetBeakerY - 64);
      }
    }

    // If any other equipment is close to target positions, nudge them slightly to avoid collision
    const occupied = equipmentPositions.filter(p => p.id !== beaker.id && p.id !== wash.id);
    const adjustIfCollision = (x: number, y: number) => {
      let nx = x;
      let ny = y;
      occupied.forEach(o => {
        if (isOverlapping(nx, ny, o.x || 0, o.y || 0, 70)) {
          ny += 80; // push down
          nx += 30; // nudge right
        }
      });
      // clamp
      nx = Math.max(8, Math.min(rect.width - 80, nx));
      ny = Math.max(8, Math.min(rect.height - 80, ny));
      return { nx, ny };
    };

    const beakerPos = adjustIfCollision(targetBeakerX, targetBeakerY);
    const washPos = adjustIfCollision(targetWashX, targetWashY);

    setEquipmentPositions(prev => {
      const updated = prev.map(pos => {
        if (pos.id === beaker.id) return { ...pos, x: beakerPos.nx, y: beakerPos.ny };
        if (pos.id === wash.id) return { ...pos, x: washPos.nx, y: washPos.ny };
        return pos;
      });
      // Ensure beaker renders on top by placing it at the end of the array
      const beakerItem = updated.find(p => p.id === beaker.id);
      if (!beakerItem) return updated;
      const others = updated.filter(p => p.id !== beaker.id);
      return [...others, beakerItem];
    });

    washAlignRef.current = true;
    try { showMessage("Click on the Rinse Beaker button to clean the beaker!", 'colorful'); } catch (e) {}
  }, [equipmentPositions, step.id]);

  // Alignment helper that forces the beaker and wash bottle into the step-4 layout.
  const alignBeakerAndWash = (force = false) => {
    try {
      if (step.id !== 4) return;
      const normalize = (value?: string) => (value ? value.toString().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_") : "");
      const beaker = equipmentPositions.find(p => normalize(p.typeId ?? p.id).includes('beaker'));
      const wash = equipmentPositions.find(p => normalize(p.typeId ?? p.id).includes('wash') || (p.typeId ?? p.id).toString().includes('wash_bottle') || (p.typeId ?? p.id).toString().includes('wash-bottle'));
      if (!beaker || !wash) return;

      const surface = document.querySelector('[data-oxalic-workbench-surface="true"]') as HTMLElement | null;
      if (!surface) return;
      const rect = surface.getBoundingClientRect();

      // If a volumetric flask was added, proactively move any weighing boat(s) out of the primary work area
      const flask = equipmentPositions.find(p => normalize(p.typeId ?? p.id).includes('volumetric_flask') || (p.typeId ?? p.id).toString().toLowerCase().includes('volumetric_flask'));
      if (flask) {
        // Use the latest positions (prev) when relocating boats so we don't rely on stale closure values
        setEquipmentPositions(prev => {
          const boats = prev.filter(p => (normalize(p.typeId ?? p.id).includes('weighing_boat') || (p.typeId ?? p.id).toString().toLowerCase().includes('weighing_boat')) && typeof p.x === 'number' && typeof p.y === 'number' && isFinite(p.x) && isFinite(p.y));
          if (boats.length === 0) return prev;
          // place boats in the top-left corner stacked vertically to match reference layout
          const baseX = Math.max(8, Math.floor(rect.width * 0.08));
          return prev.map(pos => {
            const boatIndex = boats.findIndex(b => b.id === pos.id);
            if (boatIndex === -1) return pos;
            const safeX = baseX;
            const safeY = Math.max(8, Math.floor(rect.height * 0.08 + boatIndex * 70));
            return { ...pos, x: Math.min(rect.width - 80, safeX), y: Math.min(rect.height - 80, safeY) };
          });
        });
        // Re-run alignment shortly after moving boats to ensure beaker/wash are placed correctly
        setTimeout(() => alignBeakerAndWash(true), 80);
      }

      // Preferred positions copied from the step-4 targets (adjusted to match reference image)
      let targetBeakerX = Math.max(16, Math.floor(rect.width * 0.5 - 40));
      let targetBeakerY = Math.max(12, Math.floor(rect.height * 0.44));
      // place wash bottle to the right of the beaker and slightly higher
      let targetWashX = Math.min(rect.width - 60, targetBeakerX + Math.floor(rect.width * 0.18));
      let targetWashY = Math.max(2, targetBeakerY - Math.floor(rect.height * 0.06));

      // If there are weighing boats present, avoid overlapping them by nudging beaker/wash
      const boats = equipmentPositions.filter(p => (normalize(p.typeId ?? p.id).includes('weighing_boat') || (p.typeId ?? p.id).toString().toLowerCase().includes('weighing_boat')) && typeof p.x === 'number' && typeof p.y === 'number' && isFinite(p.x) && isFinite(p.y) && (p.x > 8 || p.y > 8));

      const isOverlapping = (x1: number, y1: number, x2: number, y2: number, threshold = 60) => {
        return Math.hypot(x1 - x2, y1 - y2) < threshold;
      };

      if (boats.length > 0) {
        const boat = boats[0];
        if (isOverlapping(targetBeakerX, targetBeakerY, boat.x || 0, boat.y || 0, 80)) {
          targetBeakerX = Math.max(16, (boat.x || 0) - 20);
          targetBeakerY = (boat.y || 0) + 90; // place below the boat
          targetBeakerX = Math.min(rect.width - 80, targetBeakerX);
          targetBeakerY = Math.min(rect.height - 80, targetBeakerY);
          targetWashX = Math.min(rect.width - 60, targetBeakerX + 80);
          targetWashY = Math.max(8, targetBeakerY - 64);
        }
      }

      // Also nudge positions if other equipment is near the targets
      const occupied = equipmentPositions.filter(p => p.id !== beaker.id && p.id !== wash.id);
      const adjustIfCollision = (x: number, y: number) => {
        let nx = x;
        let ny = y;
        occupied.forEach(o => {
          if (isOverlapping(nx, ny, o.x || 0, o.y || 0, 70)) {
            ny += 80; // push down
            nx += 30; // nudge right
          }
        });
        nx = Math.max(8, Math.min(rect.width - 80, nx));
        ny = Math.max(8, Math.min(rect.height - 80, ny));
        return { nx, ny };
      };

      const beakerPos = adjustIfCollision(targetBeakerX, targetBeakerY);
      const washPos = adjustIfCollision(targetWashX, targetWashY);

      setEquipmentPositions(prev => {
        const updated = prev.map(pos => {
          if (pos.id === beaker.id) return { ...pos, x: beakerPos.nx, y: beakerPos.ny };
          if (pos.id === wash.id) return { ...pos, x: washPos.nx, y: washPos.ny };
          return pos;
        });
        // ensure beaker renders on top
        const beakerItem = updated.find(p => p.id === beaker.id);
        if (!beakerItem) return updated;
        const others = updated.filter(p => p.id !== beaker.id);
        return [...others, beakerItem];
      });
    } catch (e) { console.warn('align error', e); }
  };

  const getCurrentStepGuidance = () => {
    switch (step.id) {
      case 1:
        return "Use the calculator to determine the required mass of oxalic acid dihydrate";
      case 2:
        return "drag the oxalic acid dihydrate and spatula into the workspace";
      case 3:
        return "drag the oxalic acid dihydrate into the workspace and click on the acid to add in the boat to tare";
      case 4:
        return "drag the beaker, wash bottle and volumetric flask into the workspace";
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
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-6 right-6 z-50 text-sm px-4 py-3 rounded-md shadow-lg ${workbenchMessageVariant === 'colorful' ? 'bg-gradient-to-r from-pink-50 via-yellow-50 to-green-50 border border-transparent text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}
          >
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
                    stepId={step.id}
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
                    stepId={step.id}
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
                    stepId={step.id}
                  />
                );
              }

              return null;
            })}

            {pouring && pouring.active && (
              <div
                aria-hidden
                className="pour-animation-wrapper"
                style={{ left: pouring.x, top: pouring.y, position: 'absolute', zIndex: 70 }}
              >
                <div className="pour-bottle">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none">
                    <path d="M7 2h10v2h1v2l-1 2v6a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V8L6 6V4h1V2z" stroke="#374151" strokeWidth="1" fill="#fff" />
                    <path d="M9 4h6" stroke="#374151" strokeWidth="1" />
                  </svg>
                </div>
                <div className="pour-drops" aria-hidden>
                  {[0,1,2,3,4].map((i) => (
                    <span
                      key={i}
                      className="pour-drop"
                      style={{ left: `${50 + (i - 2) * 6}%`, animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {washAnimation && washAnimation.active && (
              <div
                aria-hidden
                className="wash-animation-wrapper"
                style={{ left: washAnimation.x, top: washAnimation.y, position: 'absolute', zIndex: 70 }}
              >
                <div className="wash-bottle" style={{ transform: 'translateX(-6px) rotate(-8deg)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none">
                    <path d="M7 2h10v2h1v2l-1 2v6a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V8L6 6V4h1V2z" stroke="#0f172a" strokeWidth="1" fill="#fff" />
                  </svg>
                </div>

                <div className="wash-drops" aria-hidden>
                  {[0,1,2,3,4].map((i) => (
                    <span
                      key={i}
                      className="wash-drop"
                      style={{ left: `${40 + (i * 7)}%`, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>

                <div className="wash-splash" aria-hidden />
              </div>
            )}

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

                {/* Additional controls for Step 3: allow user to set amount of oxalic acid to add to weighing boat */}
                {step.id === 3 && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 via-white to-yellow-25 shadow-md overflow-hidden">
                      {showAcidHint && (
                        <div className="mb-2 flex items-center justify-between space-x-3 p-2 rounded bg-gradient-to-r from-pink-50 via-yellow-50 to-green-50 border border-yellow-200">
                          <div className="text-sm font-medium text-yellow-800">New here? Enter the exact mass you want to add and click <span className="font-semibold">Add to Weighing Boat</span>.</div>
                          <button onClick={(e) => { e.stopPropagation(); dismissAcidHint(); }} className="ml-2 text-xs px-2 py-1 bg-yellow-200 rounded">Got it</button>
                        </div>
                      )}

                      <label className="block text-xs font-medium text-gray-700 mb-1">Amount to add to weighing boat (g)</label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.0001"
                          value={acidAmount}
                          onChange={(e) => setAcidAmount(e.target.value)}
                          className="w-32 p-2 border rounded text-sm font-mono bg-white"
                        />
                        <Button
                          onClick={() => {
                            // Find a weighing boat on the workbench
                            const boat = equipmentPositions.find(pos => ((pos.typeId ?? pos.id).toString().toLowerCase().includes('weighing_boat') || (pos.typeId === 'weighing_boat')) && typeof pos.x === 'number' && typeof pos.y === 'number');
                            if (!boat) {
                              showMessage('Place a weighing boat on the workbench first.');
                              return;
                            }

                            // Parse user-provided value; allow clearing the input
                            const parsedAmount = parseFloat(acidAmount);
                            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                              showMessage('Please enter a positive amount to add.');
                              return;
                            }
                            const amountToAdd = parsedAmount;

                            // Add oxalic acid to the boat immediately (so the tooltip/details show)
                            setEquipmentPositions(prev => {
                              // add the chemical to the selected boat
                              const withAdded = prev.map(pos => {
                                if (pos.id === boat.id) {
                                  return {
                                    ...pos,
                                    chemicals: [
                                      ...pos.chemicals,
                                      {
                                        id: 'oxalic_acid',
                                        name: 'Oxalic acid dihydrate',
                                        color: '#F0E68C',
                                        amount: amountToAdd,
                                        concentration: ''
                                      }
                                    ]
                                  };
                                }
                                return pos;
                              });

                              // remove any standalone oxalic acid bottles from the workbench palette area
                              const cleaned = withAdded.filter(pos => {
                                // always keep the target boat
                                if (pos.id === boat.id) return true;

                                // remove items explicitly marked as bottles containing oxalic_acid
                                if (pos.isBottle && Array.isArray(pos.chemicals) && pos.chemicals.some(c => c.id === 'oxalic_acid')) return false;

                                // remove any equipment that is itself the oxalic acid item
                                if ((pos.typeId || '').toString().toLowerCase().includes('oxalic_acid')) return false;

                                // otherwise keep
                                return true;
                              });

                              return cleaned;
                            });

                            // Notify parent to remove oxalic acid from the chemical palette
                            try {
                              if (onEquipmentPlaced) onEquipmentPlaced('oxalic_acid');
                            } catch {}

                            // start pouring animation overlay above the boat and show in-progress message
                            try {
                              showMessage('Oxalic acid is getting added...');
                              setPouring({ boatId: boat.id, x: boat.x + 40, y: boat.y - 60, active: true });
                              // clear previous timeout if any
                              if (pourTimeoutRef.current) {
                                window.clearTimeout(pourTimeoutRef.current);
                                pourTimeoutRef.current = null;
                              }
                              // After ~9 seconds replace the boat image with the provided image and stop the pouring animation
                              pourTimeoutRef.current = window.setTimeout(() => {
                                const newBoatImage = "https://cdn.builder.io/api/v1/image/assets%2F3c8edf2c5e3b436684f709f440180093%2F79b0166ed4e44df0a61c55a7208a94cf?format=webp&width=800";
                                setEquipmentPositions(prev => prev.map(pos => pos.id === boat.id ? { ...pos, imageSrc: newBoatImage } : pos));
                                setPouring(null);
                                if (pourTimeoutRef.current) { window.clearTimeout(pourTimeoutRef.current); pourTimeoutRef.current = null; }

                                // Show final message after animation completes
                                showMessage(`${amountToAdd.toFixed(4)} grams of oxalic acid added!`);
                                try { window.dispatchEvent(new CustomEvent('oxalic_image_shown')); } catch (e) {}
                              }, 9000);
                            } catch (e) {}

                          }}
                          className="w-36 flex-shrink-0 bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                        >
                          Add to Weighing Boat
                        </Button>

                        <Button
                          onClick={() => {
                            // open calculator as a quick helper
                            try { window.dispatchEvent(new CustomEvent('oxalicCalculatorReminder')); } catch {}
                            showMessage('Open the calculator to verify the required amount.');
                          }}
                          variant="outline"
                          className="w-32"
                        >
                          Calculator
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button onClick={onUndoStep} variant="outline" className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100" disabled={stepNumber <= 1}>
                        Undo Step {currentStepIndex}
                      </Button>
                      <Button onClick={onResetExperiment} variant="outline" className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100">Reset Experiment</Button>
                    </div>
                  </div>
                )}

                {/* default Undo/Reset when not in step 3 */}
                {step.id !== 3 && (
                  <div className="space-y-2">
                    <Button onClick={onUndoStep} variant="outline" className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100" disabled={stepNumber <= 1}>
                      Undo Step {currentStepIndex}
                    </Button>
                    <Button onClick={onResetExperiment} variant="outline" className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100">Reset Experiment</Button>
                  </div>
                )}

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
                <p><strong>Calculation:</strong> {(0.05 * 0.25 * 126.07).toFixed(4)} g = 0.05 M × 0.250 L �� 126.07 g/mol</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkBench;
