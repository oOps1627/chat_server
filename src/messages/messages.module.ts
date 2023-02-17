import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { MongooseModule } from "@nestjs/mongoose";
import { MessageSchema } from "./message.schema";
import { EventsModule } from "../events/events.module";
import { AuthModule } from "../auth/auth.module";
import { IdentifierModule } from "../identifier/identifier.module";

@Module({
  imports: [
    AuthModule,
    IdentifierModule,
    MongooseModule.forFeature([{name: 'Message', schema: MessageSchema}]),
    EventsModule
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService]
})
export class MessagesModule {}
