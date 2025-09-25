// Model
import { GameDocument, GameLeanDocument } from 'api/game/game.model';

// Dto
import { GameResponseDto, GameSummaryResponseDto } from 'api/game/game.dto';

// Mapper
import { BaseMapper } from 'mapper/base';

export interface IGameMapper {
  toDto: (game: GameDocument | GameLeanDocument) => GameResponseDto;
  toSummaryDto: (
    game: GameDocument | GameLeanDocument
  ) => GameSummaryResponseDto;
}

export class GameMapper
  extends BaseMapper<
    GameDocument,
    GameLeanDocument,
    GameResponseDto,
    GameSummaryResponseDto
  >
  implements IGameMapper
{
  constructor() {
    super(GameResponseDto, GameSummaryResponseDto);
  }
}
