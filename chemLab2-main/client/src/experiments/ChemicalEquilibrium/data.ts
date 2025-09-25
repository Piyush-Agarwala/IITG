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

export default ChemicalEquilibriumData;
