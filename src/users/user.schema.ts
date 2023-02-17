import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema()
export class User {
  @ApiProperty({type: 'string'})
  @Prop({unique: true, required: true})
  id: string;

  @ApiProperty({type: 'string'})
  @Prop({unique: true, required: true})
  username: string;

  @ApiProperty({type: 'string'})
  @Prop({required: true})
  password: string;

  @ApiProperty({type: 'number', isArray: true})
  @Prop()
  roomsIds: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
