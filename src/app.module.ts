import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "./users/users.module";
import { AuthModule } from './auth/auth.module';
import { EventsModule } from "./events/events.module";
import { IdentifierModule } from './identifier/identifier.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { DbConfiguration } from "./db/db-configuration";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRoot(DbConfiguration.uri, {dbName: DbConfiguration.name}),
    UsersModule,
    AuthModule,
    EventsModule,
    IdentifierModule,
    RoomsModule,
    MessagesModule
  ],
})
export class AppModule {}
