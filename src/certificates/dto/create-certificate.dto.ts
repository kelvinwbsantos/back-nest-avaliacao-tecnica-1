import { ApiProperty } from "@nestjs/swagger";

export class CreateCertificateDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    certificationId: string;
}
