import { ClientSession, startSession } from 'mongoose';

export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
  existingSession?: ClientSession
) {
  if (existingSession) return fn(existingSession);

  const session = await startSession();
  try {
    return await session.withTransaction(() => fn(session));
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
}
