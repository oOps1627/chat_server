import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ReceivedMessageDTO {
  @ApiProperty({type: 'string'})
  @IsString()
  @MaxLength(1000)
  @MinLength(1)
  @IsNotEmpty()
  readonly text: string;

  @ApiProperty()
  @IsString()
  readonly roomId: string;
}
