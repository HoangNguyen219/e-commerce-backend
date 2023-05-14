import Category from '../models/Category';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors';

const createCategory = async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  res.status(StatusCodes.CREATED).json({ category });
};

const getAllCategories = async (req: Request, res: Response) => {
  const { sort, text } = req.query;
  const queryObject: Record<string, any> = {};
  if (text) {
    queryObject.name = { $regex: text, $options: 'i' };
  }

  let result = Category.find(queryObject).populate({
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

  const categories = await result;

  const categoriesWithCount = categories.map(category => {
    const { id, name, createdAt, updatedAt } = category;
    return {
      id,
      name,
      createdAt,
      updatedAt,
      productCount: category.products!.length,
    };
  });
  res
    .status(StatusCodes.OK)
    .json({ categories: categoriesWithCount, count: categories.length });
};

const getSingleCategory = async (req: Request, res: Response) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOne({ _id: categoryId }).populate(
    'products',
  );

  if (!category) {
    throw new NotFoundError(`No category with id: ${categoryId}`);
  }

  res.status(StatusCodes.OK).json({ category });
};

const updateCategory = async (req: Request, res: Response) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOneAndUpdate(
    { _id: categoryId },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

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

export {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
