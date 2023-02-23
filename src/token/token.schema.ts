import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Token {
  @Prop()
  refreshToken: string;

  @Prop()
  userId: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
