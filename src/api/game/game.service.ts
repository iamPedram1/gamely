import { DeleteResult } from 'mongoose';

// Models
import Game from 'api/game/game.model';

// Dto
import { CreateGameDto, UpdateGameDto } from 'api/game/game.dto';

// Services
import BaseService, { IBaseService } from 'services/Base';

// Utilities
import { ValidationError } from 'utilites/errors';

// Types
import type { IGameEntity } from 'api/game/game.type';
import type { GameDocument, GameLeanDocument } from 'api/game/game.model';

export interface IGameService extends IBaseService<GameLeanDocument> {
  update: (gameId: string, data: UpdateGameDto) => Promise<GameDocument | null>;
  create: (data: CreateGameDto, userId: string) => Promise<GameDocument>;
}

class GameService extends BaseService<IGameEntity> {
  constructor() {
    super(Game);
  }

  async create(
    data: Pick<IGameEntity, 'title' | 'slug'>,
    userId: string
  ): Promise<GameDocument> {
    const game = await this.checkExistenceBySlug(data.slug);

    if (game) throw new ValidationError('A game with given slug already exist');

    const newGame = await new Game({ ...data, creator: userId }).save();
    if (!newGame) throw new ValidationError('Game could not be created');

    return newGame;
  }

  async delete(gameId: string): Promise<DeleteResult> {
    const deleted = await Game.deleteOne({ _id: gameId });

    return deleted;
  }

  async update(gameId: string, payload: UpdateGameDto) {
    return await Game.findByIdAndUpdate(
      gameId,
      { ...payload, updateDate: Date.now() },
      { new: true }
    )
      .populate('creator', 'name email')
      .exec();
  }
}

export default GameService;
