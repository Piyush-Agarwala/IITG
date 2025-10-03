import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function BufferQuiz() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Buffer pH — Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="font-semibold">Q1. When sodium ethanoate is added to ethanoic acid solution, the system becomes a:</div>
                <div className="mt-2">A) Strong acid solution<br/>B) Strong base solution<br/>C) Buffer solution<br/>D) Neutral solution</div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: C) Buffer solution</div>
              </div>

              <div>
                <div className="font-semibold">Q2. The pH of a buffer solution can be calculated using:</div>
                <div className="mt-2">A) Arrhenius equation<br/>B) Henderson–Hasselbalch equation<br/>C) van’t Hoff equation<br/>D) Nernst equation</div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: B) Henderson–Hasselbalch equation</div>
              </div>

              <div>
                <div className="font-semibold">Q3. If 10 mL of 0.1 M ethanoic acid is mixed with 10 mL of 0.1 M sodium ethanoate, the pH of the resulting solution will be approximately:</div>
                <div className="mt-2">A) 2.9<br/>B) 4.7<br/>C) 7.0<br/>D) 12.0</div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: B) 4.7</div>
              </div>

              <div>
                <div className="font-semibold">Q4. In the Henderson–Hasselbalch equation: pH = pK_a + log10([A⁻]/[HA]) the term [A⁻] refers to:</div>
                <div className="mt-2">A) Concentration of ethanoic acid<br/>B) Concentration of sodium ethanoate<br/>C) Concentration of H⁺ ions<br/>D) Concentration of OH⁻ ions</div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: B) Concentration of sodium ethanoate</div>
              </div>

              <div>
                <div className="font-semibold">Q5. What is the main observation in this experiment?</div>
                <div className="mt-2">A) pH decreases with addition of sodium ethanoate<br/>B) pH remains constant irrespective of sodium ethanoate<br/>C) pH increases with addition of sodium ethanoate<br/>D) pH becomes strongly basic</div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: C) pH increases with addition of sodium ethanoate</div>
              </div>

              <div className="flex items-center space-x-2">
                <Link href="/experiment/10">
                  <Button variant="outline" className="flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Experiment
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="bg-gray-700 text-white">Return to Experiments</Button>
                </Link>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
