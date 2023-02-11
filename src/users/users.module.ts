import { forwardRef, Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./user.schema";
import { UsersService } from "./users.service";
import { EventsModule } from "../events/events.module";
import { AuthModule } from "../auth/auth.module";
import { IdentifierModule } from "../identifier/identifier.module";

@Module({
  imports: [
    AuthModule,
    IdentifierModule,
    EventsModule,
    MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
