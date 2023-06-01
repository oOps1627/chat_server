import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { RoomSchema } from "./room.schema";
import { TokenModule } from "../token/token.module";
import { AuthModule } from "../auth/auth.module";
import { EventsModule } from "../events/events.module";
import { MessagesModule } from "../messages/messages.module";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [
        EventsModule,
        TokenModule,
        AuthModule,
        MessagesModule,
        UsersModule,
        MongooseModule.forFeature([{name: 'Room', schema: RoomSchema}])
    ],
    providers: [RoomsService],
    controllers: [RoomsController]
})
export class RoomsModule {
}
