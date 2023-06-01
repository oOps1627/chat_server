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
      const headers: IncomingHttpHeaders = event.socket.handshake.headers;
        // TODO: If the server receives a new message from the user with an expired access token it will not be emitted to other sockets.
        //  Need to refresh user token or inform user he is unauthorized.
        this._createMessage(event.data as ReceivedMessageDTO, headers).then((createdMessage) => {
          this._emitMessageEvent(createdMessage);
        }).catch((e) => console.error(e));
    });
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    return await this._messageModel.find({
     roomId: roomId ? roomId : {$exists: false}
    }).exec();
  }

  deleteMessagesByRoomId(roomId: string): Promise<any> {
    return this._messageModel.deleteMany(({roomId})).exec();
  }

  private async _createMessage(receivedMessage: ReceivedMessageDTO, headers: IncomingHttpHeaders): Promise<Message> {
    const user = this._tokenService.getDecodedAccessToken(headers);

    if (!user) {
      // TODO: handle it properly.
      console.error('Unauthorized');
      return;
    }

    return await this._messageModel.create({
      ...receivedMessage,
      authorId: user.userId,
      authorUsername: user.username,
      date: Date.now(),
    });
  }

  private _emitMessageEvent(message: Message): void {
    this._eventsGateway.emitEventToRooms(RealtimeAction.NewMessage, message, message.roomId);
  }
}
