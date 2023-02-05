import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";

@Module({
  imports: [],
  exports: [EventsGateway],
  providers: [EventsGateway],
})
export class EventsModule {}
