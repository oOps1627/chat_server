import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "./users/users.module";
import { AuthModule } from './auth/auth.module';
import { EventsModule } from "./events/events.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017', {dbName: 'quickchat-database'}),
    UsersModule,
    AuthModule,
    EventsModule
  ],
})
export class AppModule {}
