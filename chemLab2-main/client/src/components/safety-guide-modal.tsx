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
  const isAmmoniumBuffer = match && params?.id === "9";
  const isEthanoicBuffer = match && params?.id === "10";
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
            {isAmmoniumBuffer
              ? "Safety Guide — To study the change in pH of ammonium hydroxide solution on addition of ammonium chloride"
              : isEthanoicBuffer
              ? "Safety Guide — To study the change in pH of ethanoic acid on addition of sodium ethanoate"
              : isEquilibriumShift
              ? "Equilibrium Shift: [Co(H₂O)₆]²⁺ ⇌ [CoCl₄]²⁻ — Safety Guidelines"
              : isTitration1
              ? "Titration 1: NaOH vs Oxalic Acid — Safety Guide"
              : "Virtual Chemistry Lab Safety Guide"}
          </DialogTitle>
          <DialogDescription>
            {isAmmoniumBuffer
              ? (
                <div>
                  <p>
                    Here’s a <strong>comprehensive safety guide</strong> for the chemistry experiment: <em>“To study the change in pH of ammonium hydroxide solution on addition of ammonium chloride”</em>
                  </p>
                  <p className="mt-2 text-sm text-gray-600">This guide covers laboratory safety, chemical hazards, first-aid, waste disposal, emergency procedures, and post-experiment cleanup.</p>
                </div>
              ) : isEthanoicBuffer
              ? (
                <div>
                  <p>
                    Here’s a <strong>complete safety guide</strong> for the experiment: <em>“To study the change in pH of ethanoic acid on addition of sodium ethanoate.”</em>
                  </p>
                  <p className="mt-2 text-sm text-gray-600">It includes laboratory safety measures, chemical handling guidelines, first-aid steps, waste disposal, and general precautions.</p>
                </div>
              ) : isEquilibriumShift
              ? "Safety guidance specific to cobalt(II) chloride / hydrochloric acid equilibrium shift demonstration."
              : isTitration1
              ? "Safety guidance specific to NaOH vs Oxalic acid titration."
              : "Essential safety guidelines for conducting virtual chemistry experiments"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {isAmmoniumBuffer ? (
              <>
                <section>
                  <h3 className="text-lg font-semibold mb-3">🧪 1. Objective of Safety Measures</h3>
                  <p className="text-sm">To ensure safe handling of chemicals and apparatus during the experiment involving <strong>ammonium hydroxide (NH₄OH)</strong> and <strong>ammonium chloride (NH₄Cl)</strong>, both of which can cause irritation or harm if misused.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">⚗ 2. Chemical Hazards</h3>
                  <div className="overflow-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-2">Chemical</th>
                          <th className="pb-2">Nature of Hazard</th>
                          <th className="pb-2">Possible Effects</th>
                          <th className="pb-2">Safety Precautions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2">Ammonium hydroxide (NH₄OH)</td>
                          <td className="py-2">Corrosive and irritant; releases ammonia vapour</td>
                          <td className="py-2">Irritates eyes, nose, throat, and skin; inhalation causes coughing or burning sensation</td>
                          <td className="py-2">Work in a well-ventilated area or fume hood. Avoid direct inhalation. Wear gloves, goggles, and lab coat. Keep container tightly closed.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Ammonium chloride (NH₄Cl)</td>
                          <td className="py-2">Low toxicity but can irritate skin, eyes, and mucous membranes</td>
                          <td className="py-2">Coughing or irritation on inhalation; nausea if ingested</td>
                          <td className="py-2">Handle with gloves; avoid dust formation; do not taste or inhale.</td>
                        </tr>
                        <tr>
                          <td className="py-2">Distilled water</td>
                          <td className="py-2">None</td>
                          <td className="py-2">—</td>
                          <td className="py-2">Use clean, labeled containers only.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">🧤 3. Personal Protective Equipment (PPE)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Lab coat: Protects skin and clothing from splashes.</li>
                    <li>• Safety goggles: Prevents eye irritation from NH₄OH vapours or splashes.</li>
                    <li>• Gloves (nitrile or latex): Prevents contact with corrosive NH₄OH.</li>
                    <li>• Closed footwear: Protects against spills.</li>
                    <li>• Face mask (optional but recommended): Reduces exposure to ammonia vapour.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">🌬 4. Laboratory Environment</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Perform the experiment in a well-ventilated laboratory or fume hood.</li>
                    <li>• Keep chemical containers tightly closed when not in use.</li>
                    <li>• Avoid heating or mixing chemicals unnecessarily — ammonia vapour is released easily.</li>
                    <li>• Keep acidic substances away from ammonium hydroxide (to prevent hazardous neutralization reactions).</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">⚖ 5. Handling and Storage</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Label all bottles and beakers clearly (NH₄OH, NH₄Cl, distilled water).</li>
                    <li>• Store NH₄OH in a cool, shaded area away from acids.</li>
                    <li>• Do not pipette by mouth — always use a pipette filler.</li>
                    <li>• Mix solutions slowly and stir gently to avoid splashes.</li>
                    <li>• Clean all spills immediately with plenty of water.</li>
                    <li>• Wash hands thoroughly after completing the experiment.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">🚱 6. Waste Disposal</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Do not pour concentrated NH₄OH into the sink directly.</li>
                    <li>• Collect waste solution (mixture of NH₄OH and NH₄Cl) in a labeled container.</li>
                    <li>• Dilute the waste with plenty of water before disposal if permitted by local rules.</li>
                    <li>• Follow local laboratory chemical disposal protocols.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">🚨 7. First Aid Measures</h3>
                  <div className="overflow-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-2">Incident</th>
                          <th className="pb-2">Immediate Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2">Skin contact (NH₄OH or NH₄Cl)</td>
                          <td className="py-2">Rinse affected area immediately with plenty of water for at least 10–15 minutes. Remove contaminated clothing. Seek medical advice if irritation persists.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Eye contact</td>
                          <td className="py-2">Rinse eyes with clean running water for at least 15 minutes. Keep eyelids open. Seek medical attention immediately.</td>
                        </tr>
                        <tr>
                          <td className="py-2">Inhalation of NH₄OH vapour</td>
                          <td className="py-2">Move the person to fresh air immediately. Loosen clothing and ensure normal breathing. If irritation continues, seek medical help.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Accidental ingestion</td>
                          <td className="py-2">Do not induce vomiting. Rinse mouth with water. Seek medical attention immediately.</td>
                        </tr>
                        <tr>
                          <td className="py-2">Spillage</td>
                          <td className="py-2">Wear gloves, dilute with excess water, wipe with paper towel, and dispose in chemical waste container.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">🔥 8. Emergency and Good Laboratory Practices</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Know the location of eye-wash station, safety shower, and first-aid box.</li>
                    <li>• Do not eat, drink, or apply cosmetics in the laboratory.</li>
                    <li>• Avoid touching face or eyes during the experiment.</li>
                    <li>• Report all spills, injuries, or accidents to the instructor immediately.</li>
                    <li>• Keep the work area tidy and dry — pH meters and electrical equipment should not be near liquid spills.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">✅ 9. Post-Experiment Cleanup</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Rinse glassware thoroughly with tap water followed by distilled water.</li>
                    <li>• Switch off the pH meter and clean the electrode as per manufacturer instructions.</li>
                    <li>• Wipe lab benches clean and dry.</li>
                    <li>• Wash hands thoroughly before leaving the lab.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">⚠ 10. Safety Summary</h3>
                  <div className="overflow-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-2">Hazard Type</th>
                          <th className="pb-2">Risk Level</th>
                          <th className="pb-2">Preventive Measure</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2">Ammonia vapour inhalation</td>
                          <td className="py-2">Moderate</td>
                          <td className="py-2">Work under fume hood, avoid leaning over NH₄OH.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Chemical splashes</td>
                          <td className="py-2">Moderate</td>
                          <td className="py-2">Use goggles, gloves, and coat.</td>
                        </tr>
                        <tr>
                          <td className="py-2">Skin/eye irritation</td>
                          <td className="py-2">Moderate</td>
                          <td className="py-2">Wash immediately with plenty of water.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Accidental ingestion</td>
                          <td className="py-2">Low</td>
                          <td className="py-2">Never pipette by mouth; label all solutions.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            ) : isEthanoicBuffer ? (
              <>
                <section>
                  <h3 className="text-lg font-semibold mb-3">🔰 Safety Guide</h3>
                  <p className="text-sm">1. Purpose — To ensure safe handling of chemicals and instruments while studying the pH change of ethanoic acid upon addition of sodium ethanoate.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">⚗ 2. Chemicals Used</h3>
                  <div className="overflow-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-2">Chemical</th>
                          <th className="pb-2">Nature</th>
                          <th className="pb-2">Hazards</th>
                          <th className="pb-2">Safety Measures</th>
                        </tr>
                      </thead>
                      <tbody className="align-top">
                        <tr>
                          <td className="py-2">Ethanoic acid (CH₃COOH)</td>
                          <td className="py-2">Weak acid</td>
                          <td className="py-2">Corrosive in concentrated form; irritant to skin and eyes</td>
                          <td className="py-2">Use diluted solution (0.1 M). Handle with gloves and goggles. Avoid inhaling vapors.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Sodium ethanoate (CH₃COONa)</td>
                          <td className="py-2">Salt (neutral/alkaline)</td>
                          <td className="py-2">Mild irritant</td>
                          <td className="py-2">Avoid contact with eyes; wash hands after use.</td>
                        </tr>
                        <tr>
                          <td className="py-2">Distilled water</td>
                          <td className="py-2">Neutral</td>
                          <td className="py-2">No hazard</td>
                          <td className="py-2">Use only for dilution and cleaning glassware.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">🧤 3. Personal Protective Equipment (PPE)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Lab coat — to protect from spills.</li>
                    <li>• Safety goggles — to protect eyes from acid splashes.</li>
                    <li>• Gloves (preferably nitrile or latex) — to prevent skin contact.</li>
                    <li>• Closed footwear — avoid sandals or open shoes.</li>
                    <li>• Mask (optional) — if working in a poorly ventilated area.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">🧪 4. Laboratory Safety Precautions</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Perform the experiment on a clean, dry bench.</li>
                    <li>• Do not taste or directly smell any chemical.</li>
                    <li>• Use pipette filler—never pipette by mouth.</li>
                    <li>• Handle all glassware carefully; check for cracks before use.</li>
                    <li>• Keep the pH meter electrode clean and wet when not in use.</li>
                    <li>• Label all beakers containing solutions clearly to avoid confusion.</li>
                    <li>• Keep food and drinks out of the laboratory.</li>
                    <li>• In case of spillage, dilute with plenty of water and wipe immediately.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">💧 5. Chemical Handling and Mixing</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Always add acid to water, not the reverse, to prevent splashing.</li>
                    <li>• When mixing ethanoic acid and sodium ethanoate: mix slowly while stirring with a glass rod; avoid vigorous shaking or splashing.</li>
                    <li>• Dispose of small volumes (≤25 mL) of diluted solutions down the sink with plenty of running water.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">🧯 6. First Aid Measures</h3>
                  <div className="overflow-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-2">Situation</th>
                          <th className="pb-2">Immediate Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2">Skin contact (acid or salt)</td>
                          <td className="py-2">Rinse the affected area with plenty of running water for at least 10 min. Remove contaminated clothing.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Eye contact</td>
                          <td className="py-2">Rinse with cold, clean water for 10–15 min keeping eyelids open. Seek medical attention immediately.</td>
                        </tr>
                        <tr>
                          <td className="py-2">Inhalation of vapors</td>
                          <td className="py-2">Move to fresh air, keep calm, seek medical help if irritation persists.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Ingestion</td>
                          <td className="py-2">Rinse mouth with water. Do <strong>not</strong> induce vomiting. Inform the teacher or lab in-charge immediately.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">🧹 7. Waste Disposal</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Neutralize acidic residues using dilute sodium bicarbonate before disposal when appropriate.</li>
                    <li>• Discard buffer solution and rinse containers with plenty of water.</li>
                    <li>• Do not mix chemical wastes in the sink—flush separately if required by your institution.</li>
                    <li>• Dispose of broken glass in the designated glass disposal box.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">⚠ 8. Emergency Measures</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Know the location of: First aid box, Eye wash station, Fire extinguisher, Emergency exit.</li>
                    <li>• Report all accidents or spills to the instructor immediately.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">📋 9. General Precautions</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Read the experiment thoroughly before starting.</li>
                    <li>• Follow your instructor’s directions carefully.</li>
                    <li>• Never leave the experiment unattended.</li>
                    <li>• Wash your hands thoroughly after completing the experiment.</li>
                    <li>• Ensure the lab bench is clean and dry before leaving.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">✅ 10. Safety Summary Table</h3>
                  <div className="overflow-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-2">Category</th>
                          <th className="pb-2">Safety Rule</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2">Personal</td>
                          <td className="py-2">Wear lab coat, goggles, and gloves.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Chemical</td>
                          <td className="py-2">Handle ethanoic acid with care; use dilute form.</td>
                        </tr>
                        <tr>
                          <td className="py-2">Instrumental</td>
                          <td className="py-2">Calibrate and handle pH meter carefully.</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-2">Waste</td>
                          <td className="py-2">Neutralize and dispose of solutions safely.</td>
                        </tr>
                        <tr>
                          <td className="py-2">Emergency</td>
                          <td className="py-2">Know first aid and emergency procedures.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            ) : isEquilibriumShift ? (
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
                    <li>• Prefer dilute HCl (≤3–6 M) for routine demos; only use concentrated HCl to drive the blue complex if required���then hood only.</li>
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
                    <h3 className="text-lg font-semibold mb-3 text-red-800">Virtual Emergency Procedures</h3>
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
