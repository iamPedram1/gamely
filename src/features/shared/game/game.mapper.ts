import { singleton } from 'tsyringe';

// DTO
import {
  GameClientResponseDto,
  GameClientSummaryResponseDto,
} from 'features/client/game/game.client.dto';
import {
  GameManagementResponseDto,
  GameManagementSummaryResponseDto,
} from 'features/management/game/game.management.dto';

// Mapper
import { BaseMapper } from 'core/mappers/base';

// Types
import {
  GameDocument,
  GameLeanDocument,
} from 'features/shared/game/game.types';

export type IGameMapper = InstanceType<typeof GameMapper>;

@singleton()
export class GameMapper extends BaseMapper<
  GameDocument,
  GameLeanDocument,
  GameClientResponseDto,
  GameManagementResponseDto,
  GameClientSummaryResponseDto,
  GameManagementSummaryResponseDto
> {
  constructor() {
    super(
      GameClientResponseDto,
      GameManagementResponseDto,
      GameClientSummaryResponseDto,
      GameManagementSummaryResponseDto
    );
  }
}
