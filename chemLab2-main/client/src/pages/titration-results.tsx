import React, { useState } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";

export default function TitrationResultsPage() {
  const { id } = useParams<{ id: string }>();
  const experimentId = parseInt(id || "6");

  const [acidNormality, setAcidNormality] = useState<string>("");
  const [acidVolume, setAcidVolume] = useState<string>("");
  const [trials, setTrials] = useState<Array<{ initial: string; final: string }>>([
    { initial: "", final: "" },
  ]);

  const volumes = trials
    .map((t) => {
      const i = parseFloat(t.initial);
      const f = parseFloat(t.final);
      if (Number.isFinite(i) && Number.isFinite(f)) {
        return Math.max(0, f - i);
      }
      return null;
    })
    .filter((v): v is number => v !== null);

  const meanV2 = volumes.length ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
  const n1 = parseFloat(acidNormality);
  const v1 = parseFloat(acidVolume);
  const validInputs = Number.isFinite(n1) && Number.isFinite(v1) && meanV2 > 0;
  const n2 = validInputs ? (n1 * v1) / meanV2 : 0;
  const strength = n2 * 40;


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Titration Results — Live Data</h1>
          <Link href={`/experiment/${experimentId}`}>
            <Button variant="outline">Back to Experiment</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Enter Your Readings</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Oxalic Acid Normality (N₁)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={acidNormality}
                  onChange={(e) => setAcidNormality(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Oxalic Acid Volume (V₁, mL)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={acidVolume}
                  onChange={(e) => setAcidVolume(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Trial</th>
                    <th className="py-2 pr-4">Initial (mL)</th>
                    <th className="py-2 pr-4">Final (mL)</th>
                    <th className="py-2 pr-4">NaOH Used (mL)</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {trials.map((t, idx) => {
                    const i = parseFloat(t.initial);
                    const f = parseFloat(t.final);
                    const vol = Number.isFinite(i) && Number.isFinite(f) ? Math.max(0, f - i) : 0;
                    return (
                      <tr key={idx} className="border-t">
                        <td className="py-2 pr-4">{idx + 1}</td>
                        <td className="py-2 pr-4">
                          <input
                            type="number"
                            inputMode="decimal"
                            value={t.initial}
                            onChange={(e) =>
                              setTrials((prev) => prev.map((row, i2) => (i2 === idx ? { ...row, initial: e.target.value } : row)))
                            }
                            className="w-24 border rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="number"
                            inputMode="decimal"
                            value={t.final}
                            onChange={(e) =>
                              setTrials((prev) => prev.map((row, i2) => (i2 === idx ? { ...row, final: e.target.value } : row)))
                            }
                            className="w-24 border rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-2 pr-4 font-mono">{vol.toFixed(2)}</td>
                        <td className="py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTrials((prev) => prev.filter((_, i2) => i2 !== idx))}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTrials((prev) => [...prev, { initial: "", final: "" }])}
                >
                  + Add Trial
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold">Calculated Values</h2>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-xs text-gray-600">Mean Titre Volume (V₂)</div>
              <div className="text-lg font-bold">{meanV2.toFixed(2)} mL</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-xs text-gray-600">NaOH Normality (N₂)</div>
              <div className="text-lg font-bold">{n2.toFixed(4)} N</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-xs text-gray-600">Strength</div>
              <div className="text-lg font-bold">{strength.toFixed(2)} g/L</div>
            </div>

            {/* Show QUIZ button when there are at least 3 trials recorded */}
            {trials.length >= 3 && (
              <div className="pt-2">
                <Button className="w-full bg-amber-500 text-white hover:bg-amber-600" onClick={() => setShowQuiz(true)}>
                  QUIZ
                </Button>
              </div>
            )}

            {/* Quiz panel */}
            {showQuiz && (
              <div className="mt-4 p-4 bg-white border rounded">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">Titration Quiz</div>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => { setShowQuiz(false); setQuizSubmitted(false); setQuizSelections({}); setScore(0); }}>
                      Close
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="quiz-item">
                      <div className="text-sm font-medium">{idx + 1}. {q.question}</div>
                      <div className="mt-2 space-y-2">
                        {q.options.map((opt) => (
                          <label key={opt} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`q${idx}`}
                              value={opt}
                              checked={quizSelections[`q${idx}`] === opt}
                              onChange={() => handleSelect(`q${idx}`, opt)}
                              className="form-radio"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                      {quizSubmitted && (
                        <div className="mt-2 text-sm">
                          {quizSelections[`q${idx}`] === q.answer ? (
                            <span className="text-green-600 font-semibold">Correct</span>
                          ) : (
                            <span className="text-red-600">Incorrect — correct: {q.answer}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center space-x-3 mt-3">
                    <Button onClick={submitQuiz} className="bg-blue-600 text-white">Submit Quiz</Button>
                    <Button variant="outline" onClick={resetQuiz}>Reset</Button>
                    {quizSubmitted && <div className="text-sm font-semibold">Score: {score} / {questions.length}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
