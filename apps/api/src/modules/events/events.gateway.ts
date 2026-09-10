import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      // Allow all origins (localhost, netlify, vercel, mobile, etc.)
      callback(null, true);
    },
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitPermissionsUpdated(payload: { roleId?: string; roleName?: string; timestamp?: string }) {
    this.logger.log(`Emitting permissions_updated: ${JSON.stringify(payload)}`);
    if (this.server) {
      this.server.emit('permissions_updated', {
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      });
    }
  }
}
