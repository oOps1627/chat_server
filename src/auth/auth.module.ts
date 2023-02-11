import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { IdentifierModule } from "../identifier/identifier.module";
import { EventsModule } from "../events/events.module";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule,
    IdentifierModule,
    EventsModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
