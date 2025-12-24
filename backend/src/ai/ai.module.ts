import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StudyContentModule } from '../study-content/study-content.module';
import { AiController } from './ai.controller';
import { GeminiService } from './gemini.service';

@Module({
  imports: [ConfigModule, StudyContentModule],
  controllers: [AiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class AiModule {}






