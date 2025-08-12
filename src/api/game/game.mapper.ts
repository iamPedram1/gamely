import { plainToInstance } from 'class-transformer';

// Model
import { GameDocument, GameLeanDocument } from 'api/game/game.model';

// Dto
import { GameResponseDto, GameSummaryResponseDto } from 'api/game/game.dto';

export interface IGameMapper {
  toGameDto: (game: GameDocument | GameLeanDocument) => GameResponseDto;
  toGameSummaryDto: (
    game: GameDocument | GameLeanDocument
  ) => GameSummaryResponseDto;
}

export class GameMapper implements IGameMapper {
  private toPlain(game: GameDocument | GameLeanDocument) {
    return game.toObject();
  }

  toGameDto(game: GameDocument | GameLeanDocument) {
    return plainToInstance(GameResponseDto, this.toPlain(game), {
      excludeExtraneousValues: true,
    });
  }

  toGameSummaryDto(game: GameDocument | GameLeanDocument) {
    return plainToInstance(GameSummaryResponseDto, this.toPlain(game), {
      excludeExtraneousValues: true,
    });
  }
}
