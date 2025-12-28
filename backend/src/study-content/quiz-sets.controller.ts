import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuizSetDto } from './dto/create-quiz-set.dto';
import { MoveToFolderDto } from './dto/move-to-folder.dto';
import { UpdateQuizSetDto } from './dto/update-quiz-set.dto';
import { QuizSetsService } from './quiz-sets.service';

@Controller('quiz-sets')
@UseGuards(JwtAuthGuard)
export class QuizSetsController {
  constructor(private readonly quizSetsService: QuizSetsService) { }

  @Post()
  create(@CurrentUser() user: any, @Body() createDto: CreateQuizSetDto) {
    return this.quizSetsService.create(user.id, createDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.quizSetsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quizSetsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateQuizSetDto,
  ) {
    return this.quizSetsService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quizSetsService.remove(user.id, id);
  }

  @Patch(':id/folder')
  moveToFolder(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: MoveToFolderDto,
  ) {
    return this.quizSetsService.moveToFolder(user.id, id, body.folderId);
  }
}


