import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { Request } from "express";
import { CreateRoomDto } from "./create-room.dto";
import { Room } from "./room.schema";
import { AuthGuard } from "../auth/auth.guard";

@Controller('rooms')
export class RoomsController {

  constructor(private _roomsService: RoomsService) {
  }

  @UseGuards(AuthGuard)
  @Post()
  async createRoom(@Req() request: Request, @Body() body: CreateRoomDto): Promise<Room> {
    return await this._roomsService.createRoom(request, body);
  }

  @UseGuards(AuthGuard)
  @Delete(':roomId')
  async deleteRoom(@Req() request: Request, @Param('roomId') roomId: string): Promise<Room> {
    return await this._roomsService.deleteRoom(request, roomId);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getRooms(): Promise<Room[]> {
    return await this._roomsService.getAllRooms();
  }

  @UseGuards(AuthGuard)
  @Get('my')
  async getUserRooms(@Req() request: Request): Promise<Room[]> {
    return await this._roomsService.getUserRooms(request);
  }

  @UseGuards(AuthGuard)
  @Put('join/:roomId')
  async joinRoom(@Param('roomId') roomId: string, @Req() request: Request): Promise<Room> {
    return await this._roomsService.joinUserToRoom(request, roomId);
  }
}
