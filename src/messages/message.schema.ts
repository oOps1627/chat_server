import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema()
export class Message {
  @ApiProperty({ type: "string" })
  @Prop({ unique: true, required: true })
  id: string;

  @ApiProperty({ type: "string" })
  @Prop()
  text: string;

  @ApiProperty({ type: "string" })
  @Prop({ required: true })
    // @Prop({required: true, type: MongooseSchema.Types.ObjectId, ref: 'User'})
  authorId: string;

  @ApiProperty({ type: "string" })
  @Prop({ required: true })
  authorUsername: string;

  @ApiProperty({ type: "string" })
  @Prop({ required: false })
  roomId: string;

  @ApiProperty({ type: "number" })
  @Prop({ required: true })
  date: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
