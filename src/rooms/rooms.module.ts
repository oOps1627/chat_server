import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { RoomSchema } from "./room.schema";
import { IdentifierModule } from "../identifier/identifier.module";
import { AuthModule } from "../auth/auth.module";
import { EventsModule } from "../events/events.module";

@Module({
  imports: [
    EventsModule,
    IdentifierModule,
    AuthModule,
    MongooseModule.forFeature([{name: 'Room', schema: RoomSchema}])
  ],
  providers: [RoomsService],
  controllers: [RoomsController]
})
export class RoomsModule {}
