import GameService from 'features/shared/game/core/game.service';
import { container } from 'tsyringe';

export const gamePopulate = [
  { path: 'coverImage' },
  { path: 'creator', populate: 'avatar' },
];

export const generateGameService = () => container.resolve(GameService);
