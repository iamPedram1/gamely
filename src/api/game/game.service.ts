import { DeleteResult } from 'mongoose';
import { plainToInstance } from 'class-transformer';

// Models
import Game from 'api/game/game.model';

// Dto
import {
  GameResponseDto,
  GameSummaryResponseDto,
  UpdateGameDto,
} from 'api/game/game.dto';

// Services
import IBaseService, { IBaseServiceProps } from 'services/Base';

// Utilities
import { ValidationError } from 'utilites/errors';

// Types
import type { IGameProps } from 'api/game/game.type';
import type { GameDocument, GameLeanDocument } from 'api/game/game.model';

export interface IGameService extends IBaseServiceProps<GameLeanDocument> {
  update: (gameId: string, data: UpdateGameDto) => Promise<GameDocument | null>;
  create: (
    data: Pick<IGameProps, 'title' | 'slug'>,
    userId: string
  ) => Promise<GameDocument>;
}

class GameService extends IBaseService<IGameProps> {
  constructor() {
    super(Game);
  }

  async create(
    data: Pick<IGameProps, 'title' | 'slug'>,
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
