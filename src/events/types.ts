import { Socket } from "socket.io";

export enum RealtimeEvent {
  UserConnected = "UserConnected",
  UserDisconnected = "UserDisconnected",
}

export enum ConnectionAction {
  Connect,
  Disconnect
}

export interface IConnectionEvent {
  action: ConnectionAction;
  socket: Socket;
}
