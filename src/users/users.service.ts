import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { HydratedDocument, Model } from "mongoose";
import { CreateUserDto } from "./create-user.dto";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<HydratedDocument<User>>,
             ) {
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const newUser = await new this.userModel({ dto });

    return newUser.save();
  }

  async getUserByUsername(username: string): Promise<User> {
    return await this.userModel.findOne<User>({ username }).exec();
  }
}
