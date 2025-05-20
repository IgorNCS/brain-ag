
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../entities/user.entity';


export class UserResponseDTO {

    @ApiProperty({ example: 1 })
    readonly current_page: number;

    @ApiProperty({ example: 1 })
    readonly total_pages: number;

    @ApiProperty({ example: 10 })
    readonly total_per_pages: number;

    @ApiProperty({ type: [User] })
    readonly list: User[];

    @ApiProperty({ example: 1 })
    readonly totalItems: number;

    constructor(partial: Partial<UserResponseDTO>) {
        Object.assign(this, partial);
    }
}

