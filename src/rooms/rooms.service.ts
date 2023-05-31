import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Room } from "./room.schema";
import { HydratedDocument, Model } from "mongoose";
import { Request } from "express";
import { TokenService } from "../token/token.service";
import { CreateRoomDto } from "./create-room.dto";
import { EventsGateway } from "../events/events.gateway";
import { RealtimeAction } from "../events/types";

@Injectable()
export class RoomsService {
    constructor(@InjectModel(Room.name) private _roomModel: Model<HydratedDocument<Room>>,
                private _eventsGateway: EventsGateway,
                private _tokenService: TokenService) {
    }

    async getAllRooms(): Promise<Room[]> {
        return await this._roomModel.find().exec();
    }

    async getUserRooms(req: Request): Promise<Room[]> {
        const userId = this._tokenService.getDecodedAccessToken(req.headers)?.userId;

        return await this._roomModel.where({authorId: userId}).exec();
    }

    async createRoom(req: Request, createRoomDto: CreateRoomDto): Promise<Room> {
        const userId = this._tokenService.getDecodedAccessToken(req.headers)?.userId;

        return await this._roomModel.create({
            ...createRoomDto,
            authorId: userId,
            id: String(Date.now()),
            membersIds: [userId]
        } as Room).then((room: HydratedDocument<Room>) => {
            this._eventsGateway.emitEventToAll(RealtimeAction.RoomCreated, room);

            return room;
        });
    }

    async deleteRoom(req: Request, roomId: string): Promise<Room> {
        const userId = this._tokenService.getDecodedAccessToken(req.headers)?.userId;

        return this._roomModel.findOne({id: roomId}, (err, room: HydratedDocument<Room>) => {
            const isUserCreator = room.authorId === userId;

            if (!isUserCreator) {
                throw new ForbiddenException("Only creator can delete the room");
            }

            room.delete().then(() => {
                this._eventsGateway.emitEventToAll(RealtimeAction.RoomDeleted, room.id);
            });
        }).exec();
    }

    joinUserToRoom(req: Request, roomId: string): Promise<Room> {
        const userId = this._tokenService.getDecodedAccessToken(req.headers)?.userId;

        return this._roomModel.findOne({id: roomId}, (err, room: HydratedDocument<Room>) => {
            const isUserAlreadyJoined = room.membersIds.includes(userId);

            if (isUserAlreadyJoined) {
                throw new BadRequestException("User already join the group");
            }

            room.membersIds.push(userId);
            room.save().then(() => {
                this._eventsGateway.emitEventToAll(RealtimeAction.UserJoinedRoom, {room: room, userId: userId});
            });
        }).exec();
    }
}
