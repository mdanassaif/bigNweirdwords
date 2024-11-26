"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  Shuffle,
  BookOpen,
  Sparkles,
  Compass,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface ExamMeaning {
  word: string;
  meaning: string;
  partOfSpeech?: string;
  example?: string;
  icon?: string;
}

const academicParagraphs = [
  "Examine complex language structures and interpret detailed meanings of academic terms in advanced scholarly writing.",
  "Explore strategies to understand and use challenging vocabulary in various research methods and disciplines.",
  "Learn effective techniques for mastering field-specific terminology to improve academic communication and understanding.",
  "Enhance your ability to analyze and interpret sophisticated academic texts using advanced vocabulary decoding methods.",
  "Develop skills to identify and comprehend intricate linguistic patterns that appear in high-level academic writing.",
  "Refine your vocabulary by applying practical strategies for recognizing and using specialized terms in academic contexts."
];

const examPhrases = [
  "Decoding complex academic vocabulary...",
  "Processing advanced research terminology...",
  "Unveiling intricate linguistic insights...",
  "Analyzing scholarly word structures and patterns...",
  "Extracting valuable academic knowledge...",
  "Synthesizing linguistic information from research texts...",
  "Mastering the use of discipline-specific vocabulary...",
  "Understanding and interpreting advanced academic language..."
];

const VocabExamMaster = () => {
  const [text, setText] = useState("");
  const [wordSize, setWordSize] = useState(7);
  const [meanings, setMeanings] = useState<ExamMeaning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"manual" | "academic">("manual");
  const [loadingPhrase, setLoadingPhrase] = useState(examPhrases[0]);

  useEffect(() => {
    if (isLoading) {
      const phraseInterval = setInterval(() => {
        const randomPhrase =
          examPhrases[Math.floor(Math.random() * examPhrases.length)];
        setLoadingPhrase(randomPhrase);
      }, 2000);

      return () => clearInterval(phraseInterval);
    }
  }, [isLoading]);

  const handleAcademicParagraph = () => {
    const randomParagraph =
      academicParagraphs[Math.floor(Math.random() * academicParagraphs.length)];
    setText(randomParagraph);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim()) return;

      setIsLoading(true);
      setError("");
      setMeanings([]);

      try {
        const startTime = Date.now();
        const response = await fetch("/api/getMeanings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, wordSize }),
        });

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 1000) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 - elapsedTime)
          );
        }

        if (!response.ok) throw new Error("Exam vocabulary retrieval failed");

        const data = await response.json();
        setMeanings(data.meanings);
      } catch (err) {
        setError("Failed to process academic terminology.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [text, wordSize]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 w-full">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-red-100 text-red-600 px-4 py-2 rounded-full mb-4">
            <Sparkles className="mr-2" />
            <span className="font-medium">Tricky Vocabulary Capture</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Big and <span className="text-red-600">Weird Words</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Improve your English vocabs skills with techniques
          </p>
        </div>

        <div className="bg-white rounded-xl border border-red-100 p-8 shadow-sm w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-wrap items-center space-x-4 mb-4">
              <Select
                value={mode}
                onValueChange={(value: "manual" | "academic") => setMode(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Input Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 w-4 h-4" /> Manual Input
                    </div>
                  </SelectItem>
                  <SelectItem value="academic">
                    <div className="flex items-center">
                      <Shuffle className="mr-2 w-4 h-4" /> Academic Text
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {mode === "academic" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAcademicParagraph}
                  className="flex items-center"
                >
                  <Shuffle className="mr-2" /> Generate
                </Button>
              )}
            </div>

            <Textarea
              className="w-full border-2 border-red-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-300 h-[200px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                mode === "manual"
                  ? "Enter challenging academic text for vocabulary analysis..."
                  : "Click 'Generate' for an academic text"
              }
            />

            <div className="space-y-4">
              <label className="flex items-center text-sm font-medium text-red-700">
                <Compass className="mr-2" />
                Minimum Word Length for Analysis: {wordSize} letters
              </label>
              <Slider
                min={5}
                max={15}
                step={1}
                value={[wordSize]}
                onValueChange={(value) => setWordSize(value[0])}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center"
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 animate-spin" />
                  {loadingPhrase}
                </div>
              ) : (
                <>
                  Analyze Academic Vocabulary
                  <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          </form>

          {meanings.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
                Decoded Academic Terminology
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {meanings.map((item, index) => (
                  <div
                    key={index}
                    className="bg-red-50 border border-red-100 rounded-xl p-6 hover:border-red-200 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center">
                      <span className="mr-2 text-2xl">{item.icon || "🎓"}</span>
                      {item.word}
                      {item.partOfSpeech && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({item.partOfSpeech})
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-700 mb-2">{item.meaning}</p>
                    {item.example && (
                      <p className="text-sm italic text-gray-500">
                        Academic Context: {item.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabExamMaster;
