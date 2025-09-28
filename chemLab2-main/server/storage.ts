import { users, experiments, userProgress, type User, type InsertUser, type Experiment, type InsertExperiment, type UserProgress, type InsertUserProgress, type ExperimentStep } from "@shared/schema";
import fs from 'fs';
import path from 'path';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllExperiments(): Promise<Experiment[]>;
  getExperiment(id: number): Promise<Experiment | undefined>;
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
  
  getUserProgress(userId: string, experimentId: number): Promise<UserProgress | undefined>;
  getAllUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private experiments: Map<number, Experiment>;
  private userProgress: Map<string, UserProgress>;
  private currentUserId: number;
  private currentExperimentId: number;
  private currentProgressId: number;

  constructor() {
    this.users = new Map();
    this.experiments = new Map();
    this.userProgress = new Map();
    this.currentUserId = 1;
    this.currentExperimentId = 1;
    this.currentProgressId = 1;
    
    this.initializeExperiments();
  }

  private initializeExperiments() {
    try {
      const experimentsPath = path.resolve(process.cwd(), 'data', 'experiments.json');
      const experimentsData = JSON.parse(fs.readFileSync(experimentsPath, 'utf-8'));
      const filteredExperiments = Array.isArray(experimentsData)
        ? experimentsData.filter((exp: any) => exp.title !== "Preparation of Standard Solution of Oxalic Acid")
        : [];

      // Add extra experiment: change in pH of ethanoic acid with sodium ethanoate (buffer action)
      filteredExperiments.push({
        title: "To study the change in pH of ethanoic acid on addition of sodium ethanoate",
        description:
          "Study buffer action by observing how adding sodium ethanoate (the conjugate base) to ethanoic acid affects pH. Use Henderson–Hasselbalch relation to interpret results.",
        category: "Acid-Base Chemistry",
        difficulty: "Beginner",
        duration: 30,
        steps: 9,
        rating: 4.6,
        imageUrl:
          "https://cdn.builder.io/api/v1/image/assets%2Fc52292a04d4c4255a87bdaa80a28beb9%2Fd9024b9081e64d6c94e0588d642ffd0d?format=webp&width=800",
        equipment: [
          "Test Tubes (2–3)",
          "0.1 M Ethanoic (Acetic) Acid",
          "0.1 M Sodium Ethanoate (Sodium Acetate)",
          "pH Meter or pH Paper",
          "Measuring Cylinder",
          "Glass Stirring Rod",
          "Distilled Water",
        ],
        stepDetails: [
          {
            id: 1,
            title: "Drag and drop the test tube in the workbench",
            description:
              "Drag and drop the test tube in the workbench.",
            duration: "1 minute",
            completed: false,
          },
          {
            id: 2,
            title: "Prepare Acid Solution",
            description:
              "Add 10 mL of 0.1 M ethanoic acid to a clean beaker/test tube. This acts as the weak acid (HA).",
            duration: "3 minutes",
            completed: false,
          },
          {
            id: 3,
            title: "Measure Initial pH",
            description:
              "Measure and record the initial pH using a calibrated pH meter or pH paper.",
            duration: "3 minutes",
            completed: false,
          },
          {
            id: 4,
            title: "Place a new pH paper",
            description:
              "Place a fresh pH paper or pH meter strip next to the test tube so you can measure the pH after adding reagents.",
            duration: "1 minute",
            completed: false,
          },
          {
            id: 5,
            title: "Add Sodium Ethanoate",
            description:
              "Add 5 mL of 0.1 M sodium ethanoate solution (the conjugate base A–). Mix gently and allow to equilibrate.",
            duration: "4 minutes",
            completed: false,
          },
          {
            id: 6,
            title: "Observe pH Change",
            description:
              "Measure the pH again. Note the increase in pH due to buffer formation (CH3COOH/CH3COO– pair).",
            duration: "4 minutes",
            completed: false,
          },
          {
            id: 7,
            title: "Explore Different Ratios",
            description:
              "Repeat by varying the volume of sodium ethanoate (e.g., 2 mL, 10 mL). Record pH for each ratio of A– to HA.",
            duration: "8 minutes",
            completed: false,
          },
          {
            id: 8,
            title: "Relate to Henderson–Hasselbalch",
            description:
              "Compare observations with pH = pKa + log([A–]/[HA]) for ethanoic acid (pKa ≈ 4.76). Discuss buffering and limitations.",
            duration: "8 minutes",
            safety: "Avoid contact with solutions; rinse spills immediately.",
            completed: false,
          },
        ],
        safetyInfo:
          "Ethanoic acid and sodium ethanoate are mild irritants. Avoid contact with eyes/skin. Wear goggles and gloves. Dispose of solutions responsibly.",
      });

      filteredExperiments.forEach((exp: any, index: number) => {
        const experiment: Experiment = {
          id: index + 1, // Use 1-based indexing for consistent IDs
          title: exp.title,
          description: exp.description,
          category: exp.category,
          difficulty: exp.difficulty,
          duration: exp.duration,
          steps: exp.steps,
          rating: Math.round(exp.rating * 10), // Convert to integer
          imageUrl: exp.imageUrl,
          equipment: exp.equipment,
          stepDetails: exp.stepDetails,
          safetyInfo: exp.safetyInfo,
        };
        this.experiments.set(experiment.id, experiment);
        console.log(`Loaded experiment ${experiment.id}: ${experiment.title}`);
      });
      console.log(`Total experiments loaded: ${this.experiments.size}`);
    } catch (error) {
      console.error('Failed to load experiments data:', error);
      // Fallback to empty experiments if file doesn't exist
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllExperiments(): Promise<Experiment[]> {
    return Array.from(this.experiments.values());
  }

  async getExperiment(id: number): Promise<Experiment | undefined> {
    return this.experiments.get(id);
  }

  async createExperiment(insertExperiment: InsertExperiment): Promise<Experiment> {
    const id = this.currentExperimentId++;
    const experiment: Experiment = { 
      ...insertExperiment, 
      id,
      equipment: insertExperiment.equipment as string[],
      stepDetails: insertExperiment.stepDetails as ExperimentStep[]
    };
    this.experiments.set(id, experiment);
    return experiment;
  }

  async getUserProgress(userId: string, experimentId: number): Promise<UserProgress | undefined> {
    const key = `${userId}_${experimentId}`;
    return this.userProgress.get(key);
  }

  async getAllUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const key = `${progress.userId}_${progress.experimentId}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      const updated: UserProgress = {
        ...existing,
        ...progress,
        lastUpdated: new Date(),
      };
      this.userProgress.set(key, updated);
      return updated;
    } else {
      return this.createUserProgress(progress);
    }
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentProgressId++;
    const progress: UserProgress = {
      id,
      userId: insertProgress.userId,
      experimentId: insertProgress.experimentId,
      currentStep: insertProgress.currentStep ?? 0,
      completed: insertProgress.completed ?? false,
      progressPercentage: insertProgress.progressPercentage ?? 0,
      lastUpdated: new Date(),
    };
    const key = `${progress.userId}_${progress.experimentId}`;
    this.userProgress.set(key, progress);
    return progress;
  }
}

export const storage = new MemStorage();
