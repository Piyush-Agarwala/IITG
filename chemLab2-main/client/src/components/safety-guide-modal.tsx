import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Eye, Shield, Thermometer, Droplets } from "lucide-react";
import { useRoute } from "wouter";

interface SafetyGuideModalProps {
  children: React.ReactNode;
}

export default function SafetyGuideModal({ children }: SafetyGuideModalProps) {
  const [match, params] = useRoute("/experiment/:id");
  const isEquilibriumShift = match && params?.id === "1";
  const isTitration1 = match && params?.id === "6";

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            {isEquilibriumShift
              ? "Equilibrium Shift: [Co(H₂O)₆]²⁺ ⇌ [CoCl₄]²�� — Safety Guidelines"
              : isTitration1
              ? "Titration 1: NaOH vs Oxalic Acid — Safety Guide"
              : "Virtual Chemistry Lab Safety Guide"}
          </DialogTitle>
          <DialogDescription>
            {isEquilibriumShift
              ? "Safety guidance specific to cobalt(II) chloride / hydrochloric acid equilibrium shift demonstration."
              : isTitration1
              ? "Safety guidance specific to NaOH vs Oxalic acid titration."
              : "Essential safety guidelines for conducting virtual chemistry experiments"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {isEquilibriumShift ? (
              <>
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Key hazards
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Cobalt(II) salts (e.g., CoCl₂): Toxic if swallowed/inhaled, skin/eye irritant; possible carcinogen; environmental hazard (aquatic toxicity). Avoid skin contact and aerosols.</li>
                    <li>• Hydrochloric acid (HCl), especially concentrated: Corrosive; fumes irritate/burn eyes, skin, and respiratory tract. Mixing with water is exothermic.</li>
                    <li>• Heat/temperature baths: Burn/scald risk; hot glass looks like cold glass.</li>
                    <li>• Glassware: Breakage and cuts; pressure build‑up if capped with evolving fumes.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Personal protective equipment (PPE) & workspace</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Mandatory: Splash goggles, lab coat, long pants, closed shoes, nitrile gloves (change if contaminated).</li>
                    <li>• Work in a fume hood when using concentrated HCl or when noticeable HCl fumes are present.</li>
                    <li>• Keep eyewash and safety shower accessible; know their locations.</li>
                    <li>• No food/drinks. Tie back hair; avoid loose clothing.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Safer choices (if permitted by your protocol)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Prefer dilute HCl (≤3–6 M) for routine demos; only use concentrated HCl to drive the blue complex if required—then hood only.</li>
                    <li>• Use small volumes (1–5 mL scale) to minimize risk and waste.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Handling & procedure controls</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Add acid to water, never water to acid. Mix slowly; let heat dissipate.</li>
                    <li>• Use dropper/Pasteur pipette for incremental additions; cap reagents promptly.</li>
                    <li>• Avoid heating over open flames if volatile acids are present; use a controlled water bath (typically ≤60 °C) and a thermometer.</li>
                    <li>• For cooling, use an ice bath; keep containers upright and labeled.</li>
                    <li>• Do not seal vessels producing fumes; vent to the hood.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Incompatibilities & what to avoid</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Never mix HCl with oxidizers or bleach (risk of chlorine gas).</li>
                    <li>• Keep cobalt solutions away from sinks and drains (environmental hazard).</li>
                    <li>• Don’t pipette by mouth. Don’t touch face/eyes with gloved hands.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Spill & exposure response</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Small acid spill: Neutralize with sodium bicarbonate; wipe up with absorbent; dispose as hazardous chemical waste.</li>
                    <li>• Cobalt solution spill: Absorb with inert material; collect as heavy‑metal hazardous waste. Decontaminate surfaces with detergent solution.</li>
                    <li>• Skin contact (HCl or Co²⁺): Remove contaminated clothing; rinse with water 15 minutes. Seek medical attention for burns/persistent irritation.</li>
                    <li>• Eye exposure: Flush at eyewash for 15 minutes, hold lids open; get medical help.</li>
                    <li>• Inhalation of HCl fumes: Move to fresh air; seek medical attention if symptoms persist.</li>
                    <li>• Ingestion: Rinse mouth; do not induce vomiting; seek immediate medical aid.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Waste management</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Collect all cobalt‑containing wastes (solutions, rinses, contaminated absorbents, gloves) in a labeled heavy‑metal waste container.</li>
                    <li>• Acidic aqueous waste without cobalt/heavy metals may be neutralized per SOP; when in doubt, collect as hazardous.</li>
                    <li>• Deface/peel labels on empty reagent bottles; triple‑rinse only if your SOP allows and if rinsate is collected appropriately.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Storage & labeling</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Store CoCl₂ and HCl in tightly closed, compatible containers with GHS labels and dates.</li>
                    <li>• Keep acids in corrosion‑resistant secondary containment; segregate from bases and oxidizers.</li>
                    <li>• Clearly label all working solutions: chemical name, concentration, date, your name.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Housekeeping & decontamination</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Work over chemical‑resistant trays to catch drips.</li>
                    <li>• Wash benches and glassware promptly; final rinse to appropriate waste if it contains cobalt.</li>
                    <li>• Remove gloves before touching door handles, phones, or notebooks.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Pre‑lab checklist</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Read SDS for cobalt(II) chloride and hydrochloric acid.</li>
                    <li>• Inspect glassware; no cracks/chips. Have secondary containment.</li>
                    <li>• Set up fume hood sash at proper height; verify airflow.</li>
                    <li>• Prepare spill kit (bicarbonate, absorbent pads), neutralizer, and labeled waste bottles.</li>
                    <li>• Thermometer, tongs, heat‑resistant gloves ready if using hot baths.</li>
                    <li>• Emergency contacts posted; eyewash/shower tested recently.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Post‑lab checklist</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Quench/neutralize acids only as permitted; otherwise, collect as waste.</li>
                    <li>• Transfer cobalt residues and rinses to heavy‑metal waste.</li>
                    <li>• Decontaminate bench; remove PPE; wash hands thoroughly.</li>
                  </ul>
                </section>
              </>
            ) : isTitration1 ? (
              <>
                <section>
                  <h3 className="text-lg font-semibold mb-3">Personal Protective Equipment (PPE)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Wear lab coat, closed shoes, splash‑proof goggles, and nitrile gloves.</li>
                    <li>• Tie back long hair; avoid loose clothing.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Chemical Hazards</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Sodium hydroxide (NaOH): Corrosive; causes severe skin/eye burns.</li>
                    <li>• Oxalic acid (0.1N): Irritant; harmful if swallowed; avoid skin/eye contact.</li>
                    <li>• Keep all reagents clearly labeled.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Good Lab Practices</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• No mouth pipetting—use a pipette bulb/filler.</li>
                    <li>• Rinse spills immediately; keep work area dry and uncluttered.</li>
                    <li>• Clamp burette securely; check for leaks and air bubbles before starting.</li>
                    <li>• Never return unused chemicals to stock bottles.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Spill Response</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Acid spill (oxalic): Cover with sodium bicarbonate, scoop into waste; wipe and rinse.</li>
                    <li>• Base spill (NaOH): Neutralize with dilute weak acid (e.g., vinegar), then wipe and rinse.</li>
                    <li>• For skin contact: Remove contaminated clothing, flush with water 15 minutes.</li>
                    <li>• For eye exposure: Rinse at eyewash for 15 minutes and seek medical help.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Waste & Cleanup</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Collect titration waste in a labeled “Neutralized Acid/Base Waste” container.</li>
                    <li>• Neutralize to ~pH 6–8 before drain disposal only if your institution allows; otherwise hand to lab staff.</li>
                    <li>• Rinse glassware with water before returning.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Emergency Preparedness</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Know locations of eyewash, safety shower, spill kit, and first‑aid kit.</li>
                    <li>• Report all accidents and exposures immediately.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Electrical/Equipment</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• If using a magnetic stirrer, keep cords dry and hands/gloves free of chemicals.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Hygiene</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Do not eat or drink in the lab. Wash hands thoroughly after completing the experiment.</li>
                  </ul>
                </section>
              </>
            ) : (
              <>
                {/* General Safety */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    General Laboratory Safety
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Always read experiment instructions completely before starting</li>
                    <li>• Follow all procedural steps in the correct order</li>
                    <li>• Never skip safety warnings or precautions</li>
                    <li>• Report any unusual observations or unexpected results</li>
                    <li>• Keep your virtual workspace organized and clean</li>
                  </ul>
                </section>

                {/* Chemical Handling */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    Chemical Handling
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Clearly label all reagents and verify concentrations before use</li>
                    <li>• Add acid to water when diluting, never the reverse</li>
                    <li>• Do not mix unknown chemicals or exceed specified volumes</li>
                    <li>• Treat corrosive and oxidizing reagents with extra care</li>
                    <li>• Clean simulated spills immediately and reset if unsafe conditions occur</li>
                  </ul>
                </section>

                {/* Temperature Control */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-red-600" />
                    Temperature and Heating Safety
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Monitor temperature continuously during heating</li>
                    <li>• Never exceed recommended temperature ranges</li>
                    <li>• Allow hot equipment to cool before handling</li>
                    <li>• Use appropriate heating rates - avoid rapid temperature changes</li>
                    <li>• Be aware that some reactions are exothermic (release heat)</li>
                  </ul>
                </section>

                {/* Equipment Safety */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    Virtual Equipment Guidelines
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Check that all virtual equipment is properly set up</li>
                    <li>• Ensure stirring mechanisms are functioning correctly</li>
                    <li>• Verify temperature controls are responsive</li>
                    <li>• Use appropriate glassware for each step</li>
                    <li>• Follow proper mixing and stirring techniques</li>
                  </ul>
                </section>

                {/* Emergency Procedures */}
                <section>
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <h3 className="text-lg font-semibold mb-3 text-red-800">
                      Virtual Emergency Procedures
                    </h3>
                    <ul className="space-y-2 text-sm text-red-700">
                      <li>• If an experiment behaves unexpectedly, stop and review instructions</li>
                      <li>• Reset the simulation if parameters go out of safe ranges</li>
                      <li>• Contact instructor if you encounter persistent issues</li>
                      <li>• Document any unusual observations in your lab notebook</li>
                    </ul>
                  </div>
                </section>

                {/* Best Practices */}
                <section>
                  <h3 className="text-lg font-semibold mb-3">Best Practices for Virtual Labs</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Take your time - rushing leads to mistakes</li>
                    <li>• Record observations and measurements accurately</li>
                    <li>• Review safety information before each new experiment</li>
                    <li>• Practice proper laboratory techniques even in virtual environment</li>
                    <li>• Ask questions if you're unsure about any procedure</li>
                  </ul>
                </section>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
