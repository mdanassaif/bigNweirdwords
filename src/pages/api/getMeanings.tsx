import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const examWordIcons: Record<string, string> = {
  'analyze': '🔍', 'hypothesis': '🧪', 'research': '📊', 
  'theory': '💡', 'data': '📈', 'method': '🔬', 
  'conclusion': '✅', 'evidence': '🕵️', 'study': '📚', 
  'academic': '🎓', 'knowledge': '🌟', 'complex': '🧩',
  'terminology': '💬', 'sophisticated': '🏆', 'linguistic': '🌐'
};

interface ExamMeaning {
  word: string;
  meaning: string;
  partOfSpeech?: string;
  example?: string;
  icon?: string;
}

interface ExamWordDefinition {
  definition: string;
  partOfSpeech?: string;
  example?: string;
  icon?: string;
}

const academicSources = [
  {
    name: 'Academic Dictionary API',
    url: (word: string) => `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
    parse: (data: any): ExamWordDefinition => ({
      definition: data[0]?.meanings[0]?.definitions[0]?.definition || 'No advanced definition found.',
      partOfSpeech: data[0]?.meanings[0]?.partOfSpeech,
      example: data[0]?.meanings[0]?.definitions[0]?.example
    })
  }
];

const definitionCache = new Map<string, ExamWordDefinition>();

async function fetchExamDefinitionWithFallback(word: string): Promise<ExamWordDefinition> {
  if (definitionCache.has(word)) {
    return definitionCache.get(word)!;
  }

  const fetchWithTimeout = async (source: any, word: string, timeout = 3000) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(source.url(word), { 
        signal: controller.signal 
      });
      
      clearTimeout(id);
      
      if (response.ok) {
        const data = await response.json();
        return source.parse(data);
      }
    } catch (error) {
      console.error(`Error with ${source.name}:`, error);
    }
    return null;
  };

  for (const source of academicSources) {
    const definition = await fetchWithTimeout(source, word);
    if (definition) {
      definition.icon = examWordIcons[word.toLowerCase()] || '🎓';
      definitionCache.set(word, definition);
      return definition;
    }
  }

  return {
    definition: `No academic definition found for ${word}.`,
    icon: '❓'
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { text, wordSize } = req.body;

      if (!text || typeof text !== 'string' || !wordSize) {
        return res.status(400).json({ error: 'Invalid exam input' });
      }

      const words = Array.from(
        new Set(
          (text.match(new RegExp(`\\b\\w{${wordSize},}\\b`, 'g')) || [])
            .map(word => word.toLowerCase())
            .filter(word => word.length >= wordSize)
        )
      );

      const limitedWords = words.slice(0, 10);

      const meaningResults = await Promise.allSettled(
        limitedWords.map(async (word) => {
          const definitionData = await fetchExamDefinitionWithFallback(word);
          return {
            word,
            meaning: definitionData.definition,
            partOfSpeech: definitionData.partOfSpeech,
            example: definitionData.example,
            icon: definitionData.icon
          };
        })
      );

      const meanings = meaningResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<ExamMeaning>).value);

      return res.status(200).json({ 
        meanings, 
        totalWordsFound: words.length,
        processedWords: limitedWords.length
      });

    } catch (error) {
      console.error('Exam vocabulary processing error:', error);
      return res.status(500).json({ 
        error: 'Failed to process exam vocabulary.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}