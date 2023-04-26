import Company from '../models/Company';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors';

const createCompany = async (req: Request, res: Response) => {
  const company = await Company.create(req.body);
  res.status(StatusCodes.CREATED).json({ company });
};

const getAllCompanies = async (req: Request, res: Response) => {
  const categories = await Company.find({});
  res.status(StatusCodes.OK).json({ categories, count: categories.length });
};

const getSingleCompany = async (req: Request, res: Response) => {
  const { id: companyId } = req.params;

  const company = await Company.findOne({ _id: companyId }).populate('products');

  if (!company) {
    throw new NotFoundError(`No company with id: ${companyId}`);
  }

  res.status(StatusCodes.OK).json({ company });
};

const updateCompany = async (req: Request, res: Response) => {
  const { id: companyId } = req.params;

  const company = await Company.findOneAndUpdate({ _id: companyId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!company) {
    throw new NotFoundError(`No company with id: ${companyId}`);
  }

  res.status(StatusCodes.OK).json({ company });
};

const deleteCompany = async (req: Request, res: Response) => {
  const { id: companyId } = req.params;

  const company = await Company.findOne({ _id: companyId });

  if (!company) {
    throw new NotFoundError(`No company with id: ${companyId}`);
  }

  await company.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Company removed' });
};

export { createCompany, getAllCompanies, getSingleCompany, updateCompany, deleteCompany };
