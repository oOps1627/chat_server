import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Room } from "./room.schema";
import { HydratedDocument, Model } from "mongoose";
import { Request } from "express";
import { TokenService } from "../token/token.service";
import { CreateRoomDto } from "./create-room.dto";
import { EventsGateway } from "../events/events.gateway";
import { RealtimeAction } from "../events/types";
import { MessagesService } from "../messages/messages.service";
import { UsersService } from "../users/users.service";
import { Socket } from "socket.io";

@Injectable()
export class RoomsService {
    constructor(@InjectModel(Room.name) private _roomModel: Model<HydratedDocument<Room>>,
                private _eventsGateway: EventsGateway,
                private _usersService: UsersService,
                private _messagesService: MessagesService,
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

        const room = await this._roomModel.create({
            ...createRoomDto,
            authorId: userId,
        } as Room);
        this._eventsGateway.emitEventToAll(RealtimeAction.RoomCreated, room);
        await this.joinUserToRoom(req, room.id);

        return room;
    }

    async deleteRoom(req: Request, roomId: string): Promise<Room> {
        const userId = this._tokenService.getDecodedAccessToken(req.headers)?.userId;
        const room = await this._roomModel.findById(roomId).exec();
        const isUserCreator = room.authorId === userId;

        if (!isUserCreator) {
            throw new ForbiddenException("Only creator can delete the room");
        }

        await room.delete();
        await this._messagesService.deleteMessagesByRoomId(roomId);
        await this._usersService.removeUserFromRoom(userId, roomId);
        const socket: Socket = this._eventsGateway.getSocket(userId);
        EventsGateway.removeSocketFromRoom(socket, roomId);
        this._eventsGateway.emitEventToAll(RealtimeAction.RoomDeleted, room.id);

        return room;
    }

    async joinUserToRoom(req: Request, roomId: string): Promise<Room> {
        const userId = this._tokenService.getDecodedAccessToken(req.headers)?.userId;
        const room = await this._roomModel.findById(roomId).exec();
        const isUserAlreadyJoined = room.membersIds.includes(userId);

        if (isUserAlreadyJoined) {
            throw new BadRequestException("User already join the group");
        }

        room.membersIds.push(userId);
        await room.save();
        await this._usersService.joinUserToRoom(userId, roomId);
        const socket: Socket = this._eventsGateway.getSocket(userId);
        await EventsGateway.joinSocketToRooms(socket, roomId);
        this._eventsGateway.emitEventToAll(RealtimeAction.UserJoinedRoom, {room: room, userId: userId});

        return room;
    }
}
