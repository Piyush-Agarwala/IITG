import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Play } from "lucide-react";

interface HClPHAppProps {
  onBack?: () => void;
}

export default function HClPHApp({ onBack }: HClPHAppProps) {
  const [experimentStarted, setExperimentStarted] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("autostart") === "1") {
        setExperimentStarted(true);
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => onBack ? onBack() : window.history.back()}
            className="flex items-center text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experiments
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">To determine pH values of hydrochloric acid of different strengths using pH paper and universal indicator</h1>
        </div>

        <p className="text-gray-600 mb-6">Determine and compare the pH of hydrochloric acid solutions of varying concentrations using pH paper and a universal indicator solution. Learn safe handling of strong acids and how indicators reflect acidity.</p>

        <div className="flex items-start space-x-6">
          {/* Left column - Equipment */}
          <aside className="w-64 bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-3">Equipment</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">25 mL</div>
                <div>
                  <div className="font-semibold">25ml Test Tube</div>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">AC</div>
                <div>
                  <div className="font-semibold">Hydrochloric acid solution (HCl)</div>
                  <div className="text-xs text-gray-500">0.1 M, 0.01 M, 0.001 M</div>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">Na</div>
                <div>
                  <div className="font-semibold">Sodium thiosulfate</div>
                  <div className="text-xs text-gray-500">(as example)</div>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">pH</div>
                <div>
                  <div className="font-semibold">pH Paper / Universal Indicator</div>
                </div>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">Tip: Drag equipment to the workbench following the steps.</p>
          </aside>

          {/* Center - Workbench */}
          <main className="flex-1 bg-white rounded-lg shadow p-6 min-h-[560px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">Guided Mode</div>
                <div className="text-sm text-gray-600">Step 1 of 7</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">00:00</div>
                <Button
                  onClick={() => setExperimentStarted((s) => !s)}
                  className="inline-flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {experimentStarted ? "Reset" : "Start Experiment"}
                </Button>
              </div>
            </div>

            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center">
              <div className="text-center text-gray-400">Laboratory Workbench (drop equipment here)</div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `14%` }} />
              </div>
            </div>
          </main>

          {/* Right - Live Analysis */}
          <aside className="w-96 bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-3">Live Analysis</h3>
            <div className="text-sm text-gray-600 mb-4">
              <div className="font-semibold">Current Step</div>
              <div className="text-gray-800">Prepare Acid Solutions</div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500">Measured pH</div>
                <div className="text-lg font-semibold">No measurement yet</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500">A pH of HCl</div>
                <div className="text-sm">No result yet</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500">When Sodium Ethanoate is added</div>
                <div className="text-sm">No result yet</div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
