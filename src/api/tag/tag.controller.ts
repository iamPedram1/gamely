import { ITagService } from 'api/tag/tag.service';
import { CreateTagDto, UpdateTagDto } from 'api/tag/tag.dto';
import type { RequestHandler } from 'express';

export default class TagController {
  private tagService: ITagService;

  constructor(tagService: ITagService) {
    this.tagService = tagService;
  }

  getAll: RequestHandler = async (req, res) => {
    const tags = await this.tagService.getTags();

    res.status(200).send(tags);
  };

  getAllSummaries: RequestHandler = async (req, res) => {
    const tags = await this.tagService.getTagsSummaries();

    res.status(200).send(tags);
  };

  getOne: RequestHandler = async (req, res) => {
    const tag = await this.tagService.getTagById(req.params.id);

    res.status(200).json(tag);
  };

  create: RequestHandler = async (req, res) => {
    const dto = new CreateTagDto(req.body);

    const tag = await this.tagService.create(dto, req.user._id);

    res.status(201).json(tag);
  };

  delete: RequestHandler = async (req, res) => {
    const tag = await this.tagService.delete(req.params.id);

    if (tag.deletedCount === 0)
      res.status(400).send('An error accourd while deleting tag.');
    else res.status(200).json({ message: 'success' });
  };

  update: RequestHandler = async (req, res) => {
    const dto = new UpdateTagDto(req.body);

    const tag = await this.tagService.update(req.params.id, dto);

    res.status(200).json({ message: 'success', tag });
  };
}
