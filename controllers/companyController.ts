import Company from '../models/Company';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors';

const createCompany = async (req: Request, res: Response) => {
  const company = await Company.create(req.body);
  res.status(StatusCodes.CREATED).json({ company });
};

const getAllCompanies = async (req: Request, res: Response) => {
  const { sort, text } = req.query;
  const queryObject: Record<string, any> = {};
  if (text) {
    queryObject.name = { $regex: text, $options: 'i' };
  }

  let result = Company.find(queryObject).populate({
    path: 'products',
    select: '_id',
  });

  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }
  if (sort === 'a-z') {
    result = result.sort('name');
  }
  if (sort === 'z-a') {
    result = result.sort('-name');
  }

  const companies = await result;

  const companiesWithCount = companies.map(company => {
    const { id, name, createdAt, updatedAt } = company;
    return {
      id,
      name,
      createdAt,
      updatedAt,
      productCount: company.products!.length,
    };
  });

  if (sort === 'product-lowest') {
    companiesWithCount.sort((a, b) => a.productCount - b.productCount); // Sort by productCount in DES order
  }

  if (sort === 'product-highest') {
    companiesWithCount.sort((a, b) => b.productCount - a.productCount); // Sort by productCount in ASC order
  }

  res
    .status(StatusCodes.OK)
    .json({ companies: companiesWithCount, count: companies.length });
};

const getSingleCompany = async (req: Request, res: Response) => {
  const { id: companyId } = req.params;

  const company = await Company.findOne({ _id: companyId }).populate(
    'products',
  );

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

export {
  createCompany,
  getAllCompanies,
  getSingleCompany,
  updateCompany,
  deleteCompany,
};
