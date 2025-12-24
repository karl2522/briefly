import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FlashcardSetsController } from './flashcard-sets.controller';
import { FlashcardSetsService } from './flashcard-sets.service';
import { QuizSetsController } from './quiz-sets.controller';
import { QuizSetsService } from './quiz-sets.service';
import { StudyGuidesController } from './study-guides.controller';
import { StudyGuidesService } from './study-guides.service';
import { SummariesController } from './summaries.controller';
import { SummariesService } from './summaries.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    FlashcardSetsController,
    QuizSetsController,
    StudyGuidesController,
    SummariesController,
  ],
  providers: [
    FlashcardSetsService,
    QuizSetsService,
    StudyGuidesService,
    SummariesService,
  ],
  exports: [
    FlashcardSetsService,
    QuizSetsService,
    StudyGuidesService,
    SummariesService,
  ],
})
export class StudyContentModule {}


