import { singleton } from 'tsyringe';

// Model
import { GameDocument, GameLeanDocument } from 'api/game/game.model';

// DTO
import { GameResponseDto, GameSummaryResponseDto } from 'api/game/game.dto';

// Mapper
import { BaseMapper } from 'core/mappers/deprecated.base';

export type IGameMapper = InstanceType<typeof GameMapper>;

@singleton()
export class GameMapper extends BaseMapper<
  GameDocument,
  GameLeanDocument,
  GameResponseDto,
  GameSummaryResponseDto
> {
  constructor() {
    super(GameResponseDto, GameSummaryResponseDto);
  }
}
