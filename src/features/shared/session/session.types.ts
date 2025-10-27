import type { FlattenMaps, HydratedDocument, Types } from 'mongoose';

export type IToken = { sessionId: string; userId: string };
export type IRefreshToken = { sessionId: string; userId: string };
export type SessionDocument = HydratedDocument<ISessionEntity>;
export type SessionLeanDocument = FlattenMaps<ISessionEntity>;

export interface ISessionEntity {
  _id: Types.ObjectId;
  ip: string;
  userAgent: string;
  refreshToken: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  generatedAt: Date;
  lastActivity: Date;
}
