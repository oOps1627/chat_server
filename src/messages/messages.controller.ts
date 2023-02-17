import { Controller, Get, Header, Param, Query, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";

@ApiTags("Messages")
@Controller("messages")
export class MessagesController {
  constructor(private _messagesService: MessagesService) {
  }

  @UseGuards(AuthGuard)
  @Get('')
  @Header("Cache-Control", "none")
  async getMessages(@Query("roomId") roomId: string) {
    return this._messagesService.getRoomMessages(roomId);
  }
}
