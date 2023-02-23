import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { TokenModule } from "../token/token.module";
import { EventsModule } from "../events/events.module";
import { AuthGuard } from "./auth.guard";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule,
    TokenModule,
    EventsModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard
  ],
  exports: [
    AuthService,
    AuthGuard
  ]
})
export class AuthModule {}
