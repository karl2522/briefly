/**
 * Migration utility to move data from localStorage to database
 */

import { apiClient } from './api';

interface FlashcardSet {
  id: string;
  topic: string;
  flashcards: Array<{ question: string; answer: string }>;
  createdAt: string;
}

interface QuizSet {
  id: string;
  topic: string;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

interface StudyGuideHistory {
  id: string;
  content: string;
  subject: string;
  studyGuide: string;
  createdAt: string;
}

interface SummaryHistory {
  id: string;
  text: string;
  summary: string;
  length: 'short' | 'medium' | 'long';
  originalLength: number;
  summaryLength: number;
  createdAt: string;
}

export interface MigrationResult {
  success: boolean;
  migrated: {
    flashcards: number;
    quizzes: number;
    studyGuides: number;
    summaries: number;
  };
  errors: string[];
}

/**
 * Migrates all localStorage data to database
 */
export async function migrateLocalStorageToDatabase(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migrated: {
      flashcards: 0,
      quizzes: 0,
      studyGuides: 0,
      summaries: 0,
    },
    errors: [],
  };

  try {
    // Migrate flashcards
    const flashcardData = localStorage.getItem('briefly_flashcard_sets');
    if (flashcardData) {
      try {
        const flashcardSets: FlashcardSet[] = JSON.parse(flashcardData);
        for (const set of flashcardSets) {
          try {
            const response = await apiClient.createFlashcardSet({
              topic: set.topic,
              flashcards: set.flashcards,
            });
            if (response.success) {
              result.migrated.flashcards++;
            } else {
              result.errors.push(`Failed to migrate flashcard set "${set.topic}": ${response.error}`);
            }
          } catch (error) {
            result.errors.push(`Error migrating flashcard set "${set.topic}": ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        result.errors.push(`Failed to parse flashcard data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Migrate quizzes
    const quizData = localStorage.getItem('briefly_quiz_sets');
    if (quizData) {
      try {
        const quizSets: QuizSet[] = JSON.parse(quizData);
        for (const set of quizSets) {
          try {
            const response = await apiClient.createQuizSet({
              topic: set.topic,
              numberOfQuestions: set.numberOfQuestions,
              difficulty: set.difficulty,
              questions: set.quiz.map((q) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
              })),
            });
            if (response.success) {
              result.migrated.quizzes++;
            } else {
              result.errors.push(`Failed to migrate quiz set "${set.topic}": ${response.error}`);
            }
          } catch (error) {
            result.errors.push(`Error migrating quiz set "${set.topic}": ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        result.errors.push(`Failed to parse quiz data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Migrate study guides
    const studyGuideData = localStorage.getItem('briefly_study_guide_history');
    if (studyGuideData) {
      try {
        const studyGuides: StudyGuideHistory[] = JSON.parse(studyGuideData);
        for (const guide of studyGuides) {
          try {
            const response = await apiClient.createStudyGuide({
              content: guide.content,
              subject: guide.subject,
              studyGuide: guide.studyGuide,
            });
            if (response.success) {
              result.migrated.studyGuides++;
            } else {
              result.errors.push(`Failed to migrate study guide: ${response.error}`);
            }
          } catch (error) {
            result.errors.push(`Error migrating study guide: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        result.errors.push(`Failed to parse study guide data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Migrate summaries
    const summaryData = localStorage.getItem('briefly_summary_history');
    if (summaryData) {
      try {
        const summaries: SummaryHistory[] = JSON.parse(summaryData);
        for (const summary of summaries) {
          try {
            const response = await apiClient.createSummary({
              text: summary.text,
              summary: summary.summary,
              length: summary.length,
              originalLength: summary.originalLength,
              summaryLength: summary.summaryLength,
            });
            if (response.success) {
              result.migrated.summaries++;
            } else {
              result.errors.push(`Failed to migrate summary: ${response.error}`);
            }
          } catch (error) {
            result.errors.push(`Error migrating summary: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      } catch (error) {
        result.errors.push(`Failed to parse summary data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // If migration was successful, clear localStorage
    if (result.errors.length === 0) {
      localStorage.removeItem('briefly_flashcard_sets');
      localStorage.removeItem('briefly_quiz_sets');
      localStorage.removeItem('briefly_study_guide_history');
      localStorage.removeItem('briefly_summary_history');
      // Mark migration as complete
      localStorage.setItem('briefly_migration_complete', 'true');
    } else {
      result.success = false;
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Checks if localStorage has data that needs migration
 */
export function hasLocalStorageData(): boolean {
  const flashcardData = localStorage.getItem('briefly_flashcard_sets');
  const quizData = localStorage.getItem('briefly_quiz_sets');
  const studyGuideData = localStorage.getItem('briefly_study_guide_history');
  const summaryData = localStorage.getItem('briefly_summary_history');

  return !!(flashcardData || quizData || studyGuideData || summaryData);
}

/**
 * Checks if migration has already been completed
 */
export function isMigrationComplete(): boolean {
  return localStorage.getItem('briefly_migration_complete') === 'true';
}


