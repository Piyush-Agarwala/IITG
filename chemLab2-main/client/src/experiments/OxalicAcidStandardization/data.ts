import type { OxalicAcidExperiment } from "./types";

// Complete Oxalic Acid Standardization experiment data
const OxalicAcidData: OxalicAcidExperiment = {
  id: 1,
  title: "Preparation of Standard Solution of Oxalic Acid",
  description:
    "Learn to prepare a standard solution of oxalic acid dihydrate with accurate concentration. Master fundamental quantitative analysis techniques including weighing, dissolution, and volumetric preparation.",
  category: "Quantitative Analysis",
  difficulty: "Beginner",
  duration: 35,
  steps: 7,
  rating: 4.5,
  imageUrl:
    "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
  equipment: [
    "Analytical Balance",
    "Volumetric Flask (250 mL)",
    "Beaker (100 mL)",
    "Glass Rod",
    "Funnel",
    "Wash Bottle",
    "Weighing Bottle",
    "Dropper",
  ],
  stepDetails: [
    {
      id: 1,
      title: "Calculate Required Mass",
      description:
        "Calculate the mass of oxalic acid dihydrate (H₂C₂O₄·2H₂O) needed to prepare 250 mL of 0.1 M solution. Use molecular weight 126.07 g/mol.",
      duration: "5 minutes",
      temperature: "Room temperature",
      completed: false,
    },
    {
      id: 2,
      title: "Weigh Oxalic Acid",
      description:
        "drag the oxalic acid dihydrate and stirrer into the workspace",
      duration: "8 minutes",
      safety: "Handle with care, avoid skin contact",
      completed: false,
    },
    {
      id: 3,
      title: "calculate required amount of oxalic acid dihydrate",
      description:
        "Transfer the weighed oxalic acid to a 100 mL beaker. Add about 50 mL of distilled water and stir with a glass rod until completely dissolved.",
      duration: "5 minutes",
      completed: false,
    },
    {
      id: 4,
      title: "Transfer to Volumetric Flask",
      description:
        "drag the beaker, wash bottle and volumetric flask into the workspace",
      duration: "7 minutes",
      completed: false,
    },
    {
      id: 5,
      title: "add distilled water to beaker",
      description:
        "add distilled water to beaker",
      duration: "3 minutes",
      completed: false,
    },
    {
      id: 6,
      title: "Mixing of acid with distilled water",
      description:
        "drag and drop the stirrer to the workspace and click on the stirrer to mix distilled water with the acid in the weighing boat",
      duration: "5 minutes",
      completed: false,
    },
    {
      id: 7,
      title: "final mixing and result",
      description:
        "Cap the flask and invert it 20-25 times to ensure complete mixing. Calculate the exact molarity using the actual mass weighed.",
      duration: "5 minutes",
      completed: false,
    },
  ],
  safetyInfo:
    "Oxalic acid is toxic and corrosive. Avoid skin contact and inhalation. Wear safety goggles and gloves. Work in a well-ventilated area. Wash hands thoroughly after handling.",
};

export default OxalicAcidData;
