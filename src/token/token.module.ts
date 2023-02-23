import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { TokenSchema } from "./token.schema";

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([{name: 'Token', schema: TokenSchema}])
  ],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}
