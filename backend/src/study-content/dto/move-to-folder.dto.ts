import { IsString } from 'class-validator';

export class MoveToFolderDto {
    @IsString()
    folderId: string | null; // null to remove from folder
}
