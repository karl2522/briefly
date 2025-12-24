import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { sanitizeAiContent, sanitizeTopic } from '../common/utils/sanitize.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyGuideDto } from './dto/create-study-guide.dto';
import { UpdateStudyGuideDto } from './dto/update-study-guide.dto';

@Injectable()
export class StudyGuidesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateStudyGuideDto) {
    return this.prisma.studyGuide.create({
      data: {
        userId,
        content: sanitizeAiContent(createDto.content),
        subject: createDto.subject ? sanitizeTopic(createDto.subject) : null,
        studyGuide: sanitizeAiContent(createDto.studyGuide),
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.studyGuide.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const studyGuide = await this.prisma.studyGuide.findUnique({
      where: { id },
    });

    if (!studyGuide) {
      throw new NotFoundException('Study guide not found');
    }

    if (studyGuide.userId !== userId) {
      throw new ForbiddenException('You do not have access to this study guide');
    }

    return studyGuide;
  }

  async update(userId: string, id: string, updateDto: UpdateStudyGuideDto) {
    // Verify ownership
    await this.findOne(userId, id);

    return this.prisma.studyGuide.update({
      where: { id },
      data: {
        ...(updateDto.content && { content: sanitizeAiContent(updateDto.content) }),
        ...(updateDto.subject !== undefined && { subject: updateDto.subject ? sanitizeTopic(updateDto.subject) : null }),
        ...(updateDto.studyGuide && { studyGuide: sanitizeAiContent(updateDto.studyGuide) }),
      },
    });
  }

  async remove(userId: string, id: string) {
    // Verify ownership
    await this.findOne(userId, id);

    await this.prisma.studyGuide.delete({
      where: { id },
    });

    return { success: true, message: 'Study guide deleted successfully' };
  }
}

