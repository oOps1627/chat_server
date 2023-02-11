import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { IdentifierModule } from "../identifier/identifier.module";

@Module({
  imports: [IdentifierModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
