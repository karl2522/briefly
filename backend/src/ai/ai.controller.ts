import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateFlashcardsDto } from './dto/generate-flashcards.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { GenerateStudyGuideDto } from './dto/generate-study-guide.dto';
import { SummarizeTextDto } from './dto/summarize-text.dto';
import { GeminiService } from './gemini.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('flashcards')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async generateFlashcards(
    @Body() dto: GenerateFlashcardsDto,
    @CurrentUser() user: any,
  ) {
    const flashcards = await this.geminiService.generateFlashcards(dto.text, dto.topic);
    return {
      success: true,
      data: {
        flashcards,
        count: flashcards.length,
      },
    };
  }

  @Post('summarize')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async summarizeText(@Body() dto: SummarizeTextDto, @CurrentUser() user: any) {
    const summary = await this.geminiService.summarizeText(dto.text, dto.length);
    return {
      success: true,
      data: {
        summary,
        originalLength: dto.text.length,
        summaryLength: summary.length,
      },
    };
  }

  @Post('study-guide')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async generateStudyGuide(
    @Body() dto: GenerateStudyGuideDto,
    @CurrentUser() user: any,
  ) {
    const studyGuide = await this.geminiService.generateStudyGuide(dto.content, dto.subject);
    return {
      success: true,
      data: {
        studyGuide,
      },
    };
  }

  @Post('quiz')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async generateQuiz(@Body() dto: GenerateQuizDto, @CurrentUser() user: any) {
    const quiz = await this.geminiService.generateQuiz(
      dto.content,
      dto.numberOfQuestions,
      dto.difficulty,
    );
    return {
      success: true,
      data: {
        quiz,
        count: quiz.length,
      },
    };
  }
}



