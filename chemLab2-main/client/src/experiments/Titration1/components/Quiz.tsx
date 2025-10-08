import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TitrationQuiz() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Titration 1 — Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 quiz-content">

              <section className="quiz-item">
                <h3 className="font-semibold">1. Which property of oxalic acid makes it suitable as a primary standard in titration?</h3>
                <div className="mt-2 space-y-1">
                  <div>A) It is a strong acid</div>
                  <div>B) It is solid, pure, and stable in air</div>
                  <div>C) It reacts slowly with bases</div>
                  <div>D) It has a high molar mass</div>
                </div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: B) It is solid, pure, and stable in air</div>
              </section>

              <section className="quiz-item">
                <h3 className="font-semibold">2. In the reaction between oxalic acid and sodium hydroxide, the stoichiometric ratio of oxalic acid to NaOH is:</h3>
                <div className="mt-2 space-y-1">
                  <div>A) 1 : 1</div>
                  <div>B) 1 : 2</div>
                  <div>C) 2 : 1</div>
                  <div>D) 2 : 3</div>
                </div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: B) 1 : 2</div>
              </section>

              <section className="quiz-item">
                <h3 className="font-semibold">3. Why is phenolphthalein used as an indicator in this titration?</h3>
                <div className="mt-2 space-y-1">
                  <div>A) It changes color at acidic pH</div>
                  <div>B) It changes color at neutral pH</div>
                  <div>C) It changes color in the basic range, which matches the endpoint of NaOH neutralization</div>
                  <div>D) It is colored in both acidic and basic solutions</div>
                </div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: C) It changes color in the basic range, which matches the endpoint of NaOH neutralization</div>
              </section>

              <section className="quiz-item">
                <h3 className="font-semibold">4. If the volume of oxalic acid used in titration is higher than expected, what can be inferred about the NaOH solution?</h3>
                <div className="mt-2 space-y-1">
                  <div>A) Its concentration is higher than expected</div>
                  <div>B) Its concentration is lower than expected</div>
                  <div>C) It is more basic than oxalic acid</div>
                  <div>D) The indicator was faulty</div>
                </div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: B) Its concentration is lower than expected</div>
              </section>

              <section className="quiz-item">
                <h3 className="font-semibold">5. The normality of NaOH solution is calculated using the formula (N_1 V_1 = 2 N_2 V_2). The factor “2” in this equation represents:</h3>
                <div className="mt-2 space-y-1">
                  <div>A) Number of moles of water formed</div>
                  <div>B) Ratio of NaOH to oxalic acid in the reaction</div>
                  <div>C) Number of acidic hydrogens in NaOH</div>
                  <div>D) Volume correction factor</div>
                </div>
                <div className="mt-2 text-sm text-green-700 font-medium">Answer: B) Ratio of NaOH to oxalic acid in the reaction</div>
              </section>

              <div className="flex items-center space-x-2">
                <Link href="/experiment/5">
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
