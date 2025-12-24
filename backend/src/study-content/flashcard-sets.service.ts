import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { sanitizeInput, sanitizeTopic } from '../common/utils/sanitize.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlashcardSetDto } from './dto/create-flashcard-set.dto';
import { UpdateFlashcardSetDto } from './dto/update-flashcard-set.dto';

@Injectable()
export class FlashcardSetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateFlashcardSetDto) {
    return this.prisma.flashcardSet.create({
      data: {
        userId,
        topic: sanitizeTopic(createDto.topic),
        flashcards: {
          create: createDto.flashcards.map((fc, index) => ({
            question: sanitizeInput(fc.question),
            answer: sanitizeInput(fc.answer),
            order: index,
          })),
        },
      },
      include: {
        flashcards: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.flashcardSet.findMany({
      where: { userId },
      include: {
        flashcards: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { flashcards: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const flashcardSet = await this.prisma.flashcardSet.findUnique({
      where: { id },
      include: {
        flashcards: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!flashcardSet) {
      throw new NotFoundException('Flashcard set not found');
    }

    if (flashcardSet.userId !== userId) {
      throw new ForbiddenException('You do not have access to this flashcard set');
    }

    return flashcardSet;
  }

  async update(userId: string, id: string, updateDto: UpdateFlashcardSetDto) {
    // Verify ownership
    await this.findOne(userId, id);

    // If flashcards are being updated, delete old ones and create new ones
    if (updateDto.flashcards) {
      await this.prisma.flashcard.deleteMany({
        where: { flashcardSetId: id },
      });
    }

    return this.prisma.flashcardSet.update({
      where: { id },
      data: {
        ...(updateDto.topic && { topic: sanitizeTopic(updateDto.topic) }),
        ...(updateDto.flashcards && {
          flashcards: {
            create: updateDto.flashcards.map((fc, index) => ({
              question: sanitizeInput(fc.question),
              answer: sanitizeInput(fc.answer),
              order: index,
            })),
          },
        }),
      },
      include: {
        flashcards: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    // Verify ownership
    await this.findOne(userId, id);

    // Cascade delete will handle flashcards
    await this.prisma.flashcardSet.delete({
      where: { id },
    });

    return { success: true, message: 'Flashcard set deleted successfully' };
  }
}

