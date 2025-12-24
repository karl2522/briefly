import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFlashcardSetDto } from './dto/create-flashcard-set.dto';
import { UpdateFlashcardSetDto } from './dto/update-flashcard-set.dto';
import { FlashcardSetsService } from './flashcard-sets.service';

@Controller('flashcard-sets')
@UseGuards(JwtAuthGuard)
export class FlashcardSetsController {
  constructor(private readonly flashcardSetsService: FlashcardSetsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createDto: CreateFlashcardSetDto) {
    return this.flashcardSetsService.create(user.id, createDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.flashcardSetsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.flashcardSetsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateFlashcardSetDto,
  ) {
    return this.flashcardSetsService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.flashcardSetsService.remove(user.id, id);
  }
}

