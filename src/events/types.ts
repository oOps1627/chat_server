import { Socket } from "socket.io";

export enum RealtimeAction {
  UserConnected = "UserConnected",
  UserDisconnected = "UserDisconnected",
  NewMessage = 'NewMessage',
  RoomCreated = 'RoomCreated',
  RoomDeleted = 'RoomDeleted',
  UserJoinedRoom = 'UserJoinedRoom',
  UserLeaveRoom = 'UserLeaveRoom',
}

export interface IRealtimeEvent<T = unknown> {
  action: RealtimeAction;
  socket: Socket;
  data?: T;
}
