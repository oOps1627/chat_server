import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { AuthModule } from "../auth/auth.module";
import { EventsService } from "./events.service";

@Module({
  imports: [AuthModule],
  providers: [EventsGateway, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
