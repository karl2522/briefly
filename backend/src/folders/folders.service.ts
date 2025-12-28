import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        const folders = await this.prisma.folder.findMany({
            where: { userId },
            include: {
                _count: {
                    select: {
                        flashcardSets: true,
                        quizSets: true
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return folders.map((folder) => ({
            id: folder.id,
            name: folder.name,
            color: folder.color,
            flashcardCount: folder._count.flashcardSets,
            quizCount: folder._count.quizSets,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
        }));
    }

    async findOne(userId: string, id: string) {
        const folder = await this.prisma.folder.findFirst({
            where: { id, userId },
            include: {
                _count: {
                    select: {
                        flashcardSets: true,
                        quizSets: true
                    },
                },
            },
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        return {
            id: folder.id,
            name: folder.name,
            color: folder.color,
            flashcardCount: folder._count.flashcardSets,
            quizCount: folder._count.quizSets,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
        };
    }

    async create(userId: string, createFolderDto: CreateFolderDto) {
        const folder = await this.prisma.folder.create({
            data: {
                userId,
                name: createFolderDto.name,
                color: createFolderDto.color,
            },
        });

        return {
            id: folder.id,
            name: folder.name,
            color: folder.color,
            flashcardCount: 0,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
        };
    }

    async update(userId: string, id: string, updateFolderDto: UpdateFolderDto) {
        // Verify ownership
        const existing = await this.prisma.folder.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            throw new NotFoundException('Folder not found');
        }

        const folder = await this.prisma.folder.update({
            where: { id },
            data: updateFolderDto,
            include: {
                _count: {
                    select: { flashcardSets: true },
                },
            },
        });

        return {
            id: folder.id,
            name: folder.name,
            color: folder.color,
            flashcardCount: folder._count.flashcardSets,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
        };
    }

    async remove(userId: string, id: string) {
        // Verify ownership
        const existing = await this.prisma.folder.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            throw new NotFoundException('Folder not found');
        }

        // Delete folder (flashcard sets will have folderId set to null due to onDelete: SetNull)
        await this.prisma.folder.delete({
            where: { id },
        });

        return {
            success: true,
            message: 'Folder deleted successfully',
        };
    }
}
