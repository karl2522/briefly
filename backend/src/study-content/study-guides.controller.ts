import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStudyGuideDto } from './dto/create-study-guide.dto';
import { UpdateStudyGuideDto } from './dto/update-study-guide.dto';
import { StudyGuidesService } from './study-guides.service';

@Controller('study-guides')
@UseGuards(JwtAuthGuard)
export class StudyGuidesController {
  constructor(private readonly studyGuidesService: StudyGuidesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createDto: CreateStudyGuideDto) {
    return this.studyGuidesService.create(user.id, createDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.studyGuidesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.studyGuidesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateStudyGuideDto,
  ) {
    return this.studyGuidesService.update(user.id, id, updateDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.studyGuidesService.remove(user.id, id);
  }
}


