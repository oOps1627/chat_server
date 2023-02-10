import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { HydratedDocument, Model } from "mongoose";
import { CreateUserDto } from "./create-user.dto";
import { EventsService } from "../events/events.service";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<HydratedDocument<User>>,
              private _eventsGateway: EventsService
  ) {
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const newUser = await new this.userModel({ ...dto, id: String(Date.now()), roomsIds: [] });

    return newUser.save();
  }

  async getUserByUsername(username: string): Promise<User> {
    return await this.userModel.findOne<User>({ username }).exec();
  }

  async getUserById(id: string): Promise<User> {
    return await this.userModel.findOne<User>({ id }).exec();
  }
}
