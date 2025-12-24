import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { sanitizeAiContent } from '../common/utils/sanitize.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';

@Injectable()
export class SummariesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateSummaryDto) {
    return this.prisma.summary.create({
      data: {
        userId,
        text: sanitizeAiContent(createDto.text),
        summary: sanitizeAiContent(createDto.summary),
        length: createDto.length,
        originalLength: createDto.originalLength,
        summaryLength: createDto.summaryLength,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.summary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const summary = await this.prisma.summary.findUnique({
      where: { id },
    });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    if (summary.userId !== userId) {
      throw new ForbiddenException('You do not have access to this summary');
    }

    return summary;
  }

  async update(userId: string, id: string, updateDto: UpdateSummaryDto) {
    // Verify ownership
    await this.findOne(userId, id);

    return this.prisma.summary.update({
      where: { id },
      data: {
        ...(updateDto.text && { text: sanitizeAiContent(updateDto.text) }),
        ...(updateDto.summary && { summary: sanitizeAiContent(updateDto.summary) }),
        ...(updateDto.length && { length: updateDto.length }),
        ...(updateDto.originalLength !== undefined && { originalLength: updateDto.originalLength }),
        ...(updateDto.summaryLength !== undefined && { summaryLength: updateDto.summaryLength }),
      },
    });
  }

  async remove(userId: string, id: string) {
    // Verify ownership
    await this.findOne(userId, id);

    await this.prisma.summary.delete({
      where: { id },
    });

    return { success: true, message: 'Summary deleted successfully' };
  }
}


