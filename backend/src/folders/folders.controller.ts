import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FoldersService } from './folders.service';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) { }

    @Get()
    async findAll(@CurrentUser() user: any) {
        const folders = await this.foldersService.findAll(user.id);
        return {
            success: true,
            data: folders,
        };
    }

    @Get(':id')
    async findOne(@CurrentUser() user: any, @Param('id') id: string) {
        const folder = await this.foldersService.findOne(user.id, id);
        return {
            success: true,
            data: folder,
        };
    }

    @Post()
    async create(@CurrentUser() user: any, @Body() createFolderDto: CreateFolderDto) {
        const folder = await this.foldersService.create(user.id, createFolderDto);
        return {
            success: true,
            data: folder,
        };
    }

    @Patch(':id')
    async update(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() updateFolderDto: UpdateFolderDto,
    ) {
        const folder = await this.foldersService.update(user.id, id, updateFolderDto);
        return {
            success: true,
            data: folder,
        };
    }

    @Delete(':id')
    async remove(@CurrentUser() user: any, @Param('id') id: string) {
        const result = await this.foldersService.remove(user.id, id);
        return result;
    }
}
