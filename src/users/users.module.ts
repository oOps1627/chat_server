import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./user.schema";
import { UsersService } from "./users.service";
import { EventsModule } from "../events/events.module";
import { AuthModule } from "../auth/auth.module";
import { TokenModule } from "../token/token.module";

@Module({
  imports: [
    AuthModule,
    TokenModule,
    EventsModule,
    MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
