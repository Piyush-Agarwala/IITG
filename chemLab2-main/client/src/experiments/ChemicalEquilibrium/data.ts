import type { ChemicalEquilibriumExperiment } from "./types";

// Complete Chemical Equilibrium experiment data
const ChemicalEquilibriumData: ChemicalEquilibriumExperiment = {
  id: 3,
  title: "Chemical Equilibrium",
  description:
    "Investigate Le Chatelier's principle by observing how changes in concentration, temperature, and pressure affect chemical equilibrium. Study the cobalt(II) chloride equilibrium system.",
  category: "Equilibrium",
  difficulty: "Intermediate",
  duration: 40,
  steps: 6,
  rating: 4.7,
  imageUrl:
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
  equipment: [
    "Test Tubes",
    "Test Tube Rack",
    "Dropper Pipettes",
    "Hot Water Bath",
    "Ice Bath",
    "Graduated Cylinders",
    "Stirring Rods",
    "Thermometer",
  ],
  stepDetails: [
    {
      id: 1,
      title: "Prepare Solutions",
      description:
        "1. Take a test tube and add a small amount of cobalt chloride crystals. 2. Add distilled water slowly and stir until it dissolves. 3. You will see a pink solution because of the hydrated [Co(H₂O)₆]²⁺ complex.",
      duration: "5 minutes",
      temperature: "Room temperature",
      completed: false,
    },
    {
      id: 2,
      title: "Add Concentrated HCl",
      description:
        "Slowly add drops of concentrated HCl to the cobalt solution. Observe the color change from pink to blue as the equilibrium shifts.",
      duration: "8 minutes",
      safety: "Caution: Concentrated HCl is corrosive",
      completed: false,
    },
    {
      id: 3,
      title: "Dilute with Water",
      description:
        "Add distilled water to the blue solution. Observe the color change back to pink as the equilibrium shifts in the reverse direction.",
      duration: "5 minutes",
      completed: false,
    },
    {
      id: 4,
      title: "Temperature Effect - Heating",
      description:
        "Heat the pink solution in a water bath. Observe how increased temperature affects the equilibrium position and color.",
      duration: "10 minutes",
      temperature: "60°C",
      completed: false,
    },
    {
      id: 5,
      title: "Temperature Effect - Cooling",
      description:
        "Cool the heated solution in an ice bath. Observe how decreased temperature shifts the equilibrium back.",
      duration: "8 minutes",
      temperature: "0°C",
      completed: false,
    },
    {
      id: 6,
      title: "Record Observations",
      description:
        "Document all color changes and relate them to Le Chatelier's principle. Calculate equilibrium constants where applicable.",
      duration: "7 minutes",
      completed: false,
    },
  ],
  safetyInfo:
    "Concentrated HCl is highly corrosive. Cobalt compounds are toxic if ingested. Always wear safety goggles, gloves, and work in a well-ventilated area. Handle hot and cold solutions with appropriate equipment.",
};

export const PHHClExperiment: ChemicalEquilibriumExperiment = {
  id: 4,
  title: "To determine pH values of hydrochloric acid of different strengths using pH paper and universal indicator",
  description: "Determine and compare the pH of hydrochloric acid solutions of varying concentrations using pH paper and a universal indicator solution.",
  category: "Acid-Base",
  difficulty: "Beginner",
  duration: 40,
  steps: 7,
  rating: 4.6,
  imageUrl: "https://images.pexels.com/photos/416035/pexels-photo-416035.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&h=400",
  equipment: [
    "Beakers (50 mL and 100 mL)",
    "Volumetric Flasks",
    "Droppers/Pipettes",
    "Graduated Cylinders",
    "pH Paper (universal pH strips)",
    "Universal Indicator Solution",
    "Glass Rods",
    "Wash Bottle (distilled water)",
    "Safety Goggles and Gloves",
    "Labels and Marker"
  ],
  stepDetails: [
    { id: 1, title: "Prepare Acid Solutions", description: "Prepare three different strengths of hydrochloric acid solutions (e.g. 0.1 M, 0.01 M, 0.001 M) by appropriate dilution of a standard HCl stock using volumetric flasks and distilled water. Label each flask clearly.", duration: "8 minutes", completed: false },
    { id: 2, title: "Arrange Workspace and Safety", description: "Put on safety goggles and gloves. Place beakers on a clean bench, keep a wash bottle handy, and ensure all containers are labeled.", duration: "3 minutes", safety: "Handle acids with care; avoid spills and skin contact", completed: false },
    { id: 3, title: "Measure pH with pH Paper", description: "Dip a strip of universal pH paper into each acid solution, or place a drop of solution onto the pH paper. Compare the resulting color with the pH chart to estimate pH and record the value for each concentration.", duration: "6 minutes", completed: false },
    { id: 4, title: "Measure with Universal Indicator", description: "Add a few drops of universal indicator solution to separate small aliquots of each acid strength in clean beakers. Observe and record the color change and compare to the indicator chart to determine pH range.", duration: "6 minutes", completed: false },
    { id: 5, title: "Compare and Analyze Results", description: "Compare pH readings obtained from pH paper and universal indicator for each concentration. Note discrepancies and discuss reasons (precision, indicator ranges, concentration effects).", duration: "8 minutes", completed: false },
    { id: 6, title: "Clean Up", description: "Neutralize any small acid spills with sodium bicarbonate solution, rinse glassware thoroughly with distilled water, and properly dispose of used pH paper and indicator solutions as per laboratory guidelines.", duration: "5 minutes", safety: "Neutralize spills immediately and dispose of waste safely", completed: false },
    { id: 7, title: "Record Observations and Conclusion", description: "Prepare a short report listing prepared concentrations, measured pH values (from both methods), discuss accuracy and sources of error, and conclude on the relationship between HCl concentration and pH.", duration: "4 minutes", completed: false }
  ],
  safetyInfo: "Hydrochloric acid is corrosive and can cause burns and eye damage. Always wear safety goggles, gloves, and protective clothing. Prepare dilutions carefully, always add acid to water, not water to acid. Work in a well-ventilated area and have neutralizing agents (e.g., sodium bicarbonate) available. Dispose of waste according to local regulations."
};

export default ChemicalEquilibriumData;
