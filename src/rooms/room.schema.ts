import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Room {
  @Prop({unique: true, required: true})
  id: string;

  @Prop()
  membersIds: string[];

  @Prop()
  name: string;

  @Prop()
  authorId: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
