import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FlashcardSetsService } from '../study-content/flashcard-sets.service';
import { QuizSetsService } from '../study-content/quiz-sets.service';
import { StudyGuidesService } from '../study-content/study-guides.service';
import { SummariesService } from '../study-content/summaries.service';
import { GenerateFlashcardsDto } from './dto/generate-flashcards.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { GenerateStudyGuideDto } from './dto/generate-study-guide.dto';
import { SummarizeTextDto } from './dto/summarize-text.dto';
import { GeminiService } from './gemini.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly flashcardSetsService: FlashcardSetsService,
    private readonly quizSetsService: QuizSetsService,
    private readonly studyGuidesService: StudyGuidesService,
    private readonly summariesService: SummariesService,
  ) { }

  @Post('flashcards')
  async generateFlashcards(
    @Body() dto: GenerateFlashcardsDto,
    @CurrentUser() user: any,
  ) {
    const flashcards = await this.geminiService.generateFlashcards(dto.text, dto.topic);

    // Auto-save to database
    const flashcardSet = await this.flashcardSetsService.create(user.id, {
      topic: dto.topic || 'Untitled',
      flashcards: flashcards.map((fc) => ({
        question: fc.question,
        answer: fc.answer,
      })),
    });

    return {
      success: true,
      data: {
        flashcards,
        count: flashcards.length,
        flashcardSetId: flashcardSet.id,
      },
    };
  }

  @Post('summarize')
  async summarizeText(@Body() dto: SummarizeTextDto, @CurrentUser() user: any) {
    const length = dto.length || 'medium'; // Default to 'medium' if not provided
    const summary = await this.geminiService.summarizeText(dto.text, length);

    // Auto-save to database
    const savedSummary = await this.summariesService.create(user.id, {
      text: dto.text,
      summary,
      length,
      originalLength: dto.text.length,
      summaryLength: summary.length,
    });

    return {
      success: true,
      data: {
        summary,
        originalLength: dto.text.length,
        summaryLength: summary.length,
        summaryId: savedSummary.id,
      },
    };
  }

  @Post('study-guide')
  async generateStudyGuide(
    @Body() dto: GenerateStudyGuideDto,
    @CurrentUser() user: any,
  ) {
    const studyGuide = await this.geminiService.generateStudyGuide(dto.content, dto.subject);

    // Auto-save to database
    const savedStudyGuide = await this.studyGuidesService.create(user.id, {
      content: dto.content,
      subject: dto.subject,
      studyGuide,
    });

    return {
      success: true,
      data: {
        studyGuide,
        studyGuideId: savedStudyGuide.id,
      },
    };
  }

  @Post('quiz')
  async generateQuiz(@Body() dto: GenerateQuizDto, @CurrentUser() user: any) {
    const quiz = await this.geminiService.generateQuiz(
      dto.content,
      dto.numberOfQuestions,
      dto.difficulty,
    );

    // Auto-save to database
    // Generate topic from first question if available
    const topic = quiz.length > 0 && quiz[0].question
      ? quiz[0].question.substring(0, 50).trim() + (quiz[0].question.length > 50 ? '...' : '')
      : 'Untitled Quiz';

    const quizSet = await this.quizSetsService.create(user.id, {
      topic,
      numberOfQuestions: dto.numberOfQuestions || quiz.length,
      difficulty: dto.difficulty || 'medium',
      questions: quiz.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    });

    return {
      success: true,
      data: {
        quiz,
        count: quiz.length,
        quizSetId: quizSet.id,
      },
    };
  }
}






