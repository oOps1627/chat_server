import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateRoomDto {
  @IsString()
  @MaxLength(100)
  @MinLength(3)
  name: string;
}
