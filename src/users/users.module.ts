import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./user.schema";
import { UsersService } from "./users.service";
import { EventsModule } from "../events/events.module";

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
    EventsModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
