import { Module } from '@nestjs/common';
import { IdentifierService } from './identifier.service';
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [JwtModule],
  providers: [IdentifierService],
  exports: [IdentifierService]
})
export class IdentifierModule {}
