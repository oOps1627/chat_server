import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Message } from "./message.schema";
import { HydratedDocument, Model } from "mongoose";
import { EventsGateway } from "../events/events.gateway";
import { filter } from "rxjs";
import { RealtimeAction } from "../events/types";
import { ReceivedMessageDTO } from "./recieved-message.dto";
import { IncomingHttpHeaders } from "http";
import { TokenService } from "../token/token.service";

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private _messageModel: Model<HydratedDocument<Message>>,
              private _tokenService: TokenService,
              private _eventsGateway: EventsGateway) {
    this._eventsGateway.events$.pipe(
      filter((event) => event.action === RealtimeAction.NewMessage),
    ).subscribe((event) => {
      const message: Message = this._createMessage(event.data as ReceivedMessageDTO, event.socket.handshake.headers);
      this._saveMassageInDB(message).then(() => {
        this._emitMessageEvent(message);
      }).catch((e) => console.error(e));
    });
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    return await this._messageModel.find({
     roomId: roomId ? roomId : {$exists: false}
    }).exec();
  }

  private async _saveMassageInDB(message: Message): Promise<Message> {
    return this._messageModel.create(message);
  }

  private _createMessage(receivedMessage: ReceivedMessageDTO, headers: IncomingHttpHeaders): Message {
    const user = this._tokenService.getDecodedAccessToken(headers);

    return {
      ...receivedMessage,
      authorId: user.userId,
      authorUsername: user.username,
      date: Date.now(),
      id: String(Date.now())
    }
  }

  private _emitMessageEvent(message: Message): void {
    this._eventsGateway.emitEventToRooms(RealtimeAction.NewMessage, message, message.roomId);
  }
}
