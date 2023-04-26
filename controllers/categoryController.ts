import Category from '../models/Category';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors';

const createCategory = async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  res.status(StatusCodes.CREATED).json({ category });
};

const getAllCategories = async (req: Request, res: Response) => {
  const categories = await Category.find({});
  res.status(StatusCodes.OK).json({ categories, count: categories.length });
};

const getSingleCategory = async (req: Request, res: Response) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOne({ _id: categoryId }).populate('products');

  if (!category) {
    throw new NotFoundError(`No category with id: ${categoryId}`);
  }

  res.status(StatusCodes.OK).json({ category });
};

const updateCategory = async (req: Request, res: Response) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOneAndUpdate({ _id: categoryId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new NotFoundError(`No category with id: ${categoryId}`);
  }

  res.status(StatusCodes.OK).json({ category });
};

const deleteCategory = async (req: Request, res: Response) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOne({ _id: categoryId });

  if (!category) {
    throw new NotFoundError(`No category with id: ${categoryId}`);
  }

  await category.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Category removed' });
};

export { createCategory, getAllCategories, getSingleCategory, updateCategory, deleteCategory };
