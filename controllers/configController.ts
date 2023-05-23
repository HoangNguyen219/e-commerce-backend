import Config from '../models/Config';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors';

const createConfig = async (req: Request, res: Response) => {
  const { value, dataType } = req.body;

  const config = await Config.create(req.body);
  res.status(StatusCodes.CREATED).json({ config });
};

const getAllConfigs = async (req: Request, res: Response) => {
  const configs = await Config.find({});
  res.status(StatusCodes.OK).json({ configs, count: configs.length });
};

const getSingleConfig = async (req: Request, res: Response) => {
  const { id } = req.params;

  const config = await Config.findOne({ _id: id });

  if (!config) {
    throw new NotFoundError(`No config with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({ config });
};

const updateConfig = async (req: Request, res: Response) => {
  const { id } = req.params;

  const config = await Config.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!config) {
    throw new NotFoundError(`No config with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({ config });
};

const deleteConfig = async (req: Request, res: Response) => {
  const { id } = req.params;

  const config = await Config.findOne({ _id: id });

  if (!config) {
    throw new NotFoundError(`No config with id: ${id}`);
  }

  await config.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Config removed' });
};

export {
  createConfig,
  getAllConfigs,
  getSingleConfig,
  updateConfig,
  deleteConfig,
};
