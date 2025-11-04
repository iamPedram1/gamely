import { delay, inject, injectable } from 'tsyringe';
import type { RequestHandler } from 'express';

// Service
import UserBanService from 'features/management/user/ban/ban.service';

// Utilities
import sendResponse from 'core/utilities/response';
import { UserBanMapper } from 'features/management/user/ban/ban.mapper';
import {
  BanManagementQueryDto,
  CreateBanDto,
} from 'features/management/user/ban/ban.dto';

@injectable()
export default class UserBanController {
  constructor(
    @inject(delay(() => UserBanMapper))
    private userBanMapper: UserBanMapper,
    @inject(delay(() => UserBanService))
    private userBanService: UserBanService
  ) {}

  ban: RequestHandler = async (req, res) => {
    const dto = req.body as CreateBanDto;

    await this.userBanService.ban(req.params.targetId, dto);

    sendResponse(res, 204);
  };

  unban: RequestHandler = async (req, res) => {
    await this.userBanService.unban(req.params.targetId);

    sendResponse(res, 204);
  };

  getBanList: RequestHandler = async (req, res) => {
    const query = req.query as unknown as BanManagementQueryDto;
    const filter = await this.userBanService.buildFilterFromQuery(query, {
      filterBy: [
        { queryKey: 'type', modelKey: 'type', logic: 'and' },
        { queryKey: 'actor', modelKey: 'actor', logic: 'and' },
        { queryKey: 'user', modelKey: 'user', logic: 'and' },
        { queryKey: 'status', modelKey: 'status', logic: 'and' },
      ],
    });
    const bans = await this.userBanService.getBanList({ query, filter });

    sendResponse(res, 200, {
      httpMethod: 'GET',
      featureName: 'models.UserBan.plural',
      body: {
        data: {
          pagination: bans.pagination,
          docs: bans.docs.map((doc) => this.userBanMapper.toUserBanDto(doc)),
        },
      },
    });
  };
}
