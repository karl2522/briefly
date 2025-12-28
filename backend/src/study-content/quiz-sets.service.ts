import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { sanitizeInput, sanitizeTopic } from '../common/utils/sanitize.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizSetDto } from './dto/create-quiz-set.dto';
import { UpdateQuizSetDto } from './dto/update-quiz-set.dto';

@Injectable()
export class QuizSetsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createDto: CreateQuizSetDto) {
    return this.prisma.quizSet.create({
      data: {
        userId,
        topic: sanitizeTopic(createDto.topic),
        numberOfQuestions: createDto.numberOfQuestions,
        difficulty: createDto.difficulty,
        questions: {
          create: createDto.questions.map((q, index) => ({
            question: sanitizeInput(q.question),
            options: q.options.map(opt => sanitizeInput(opt)),
            correctAnswer: q.correctAnswer,
            order: index,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.quizSet.findMany({
      where: { userId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const quizSet = await this.prisma.quizSet.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quizSet) {
      throw new NotFoundException('Quiz set not found');
    }

    if (quizSet.userId !== userId) {
      throw new ForbiddenException('You do not have access to this quiz set');
    }

    return quizSet;
  }

  async update(userId: string, id: string, updateDto: UpdateQuizSetDto) {
    // Verify ownership
    await this.findOne(userId, id);

    // If questions are being updated, delete old ones and create new ones
    if (updateDto.questions) {
      await this.prisma.quizQuestion.deleteMany({
        where: { quizSetId: id },
      });
    }

    return this.prisma.quizSet.update({
      where: { id },
      data: {
        ...(updateDto.topic && { topic: sanitizeTopic(updateDto.topic) }),
        ...(updateDto.numberOfQuestions && { numberOfQuestions: updateDto.numberOfQuestions }),
        ...(updateDto.difficulty && { difficulty: updateDto.difficulty }),
        ...(updateDto.questions && {
          questions: {
            create: updateDto.questions.map((q, index) => ({
              question: sanitizeInput(q.question),
              options: q.options.map(opt => sanitizeInput(opt)),
              correctAnswer: q.correctAnswer,
              order: index,
            })),
          },
        }),
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    // Verify ownership
    await this.findOne(userId, id);

    // Cascade delete will handle questions
    await this.prisma.quizSet.delete({
      where: { id },
    });

    return { success: true, message: 'Quiz set deleted successfully' };
  }

  async moveToFolder(userId: string, id: string, folderId: string | null) {
    // Verify ownership
    await this.findOne(userId, id);

    // If folderId is provided, verify folder exists and belongs to user
    if (folderId) {
      const folder = await this.prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
    }

    return this.prisma.quizSet.update({
      where: { id },
      data: { folderId },
    });
  }
}


