import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { transformID } from "../helpers/json-transformer";

@Schema({
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: transformID
  }
})
export class Room {
  id: string;

  @Prop()
  membersIds: string[];

  @Prop({unique: true})
  name: string;

  @Prop()
  authorId: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
