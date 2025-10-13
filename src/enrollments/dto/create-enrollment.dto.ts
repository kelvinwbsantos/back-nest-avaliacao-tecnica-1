import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CreateEnrollmentDto {
    @ApiProperty({
        description: 'Certificate ID user want to enroll',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsUUID()
    certificateId: string;
}
