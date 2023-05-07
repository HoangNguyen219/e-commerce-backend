import Product from '../models/Product';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import fs from 'fs';
import cloudinary from 'cloudinary';
import { log } from 'console';

const cloudinaryV2 = cloudinary.v2;

const createProduct = async (req: Request, res: Response) => {
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req: Request, res: Response) => {
  const { categoryId, companyId, color, price, shipping, sort, text } =
    req.query;
  const queryObject: Record<string, any> = {};

  // add stuff based on condition
  if (categoryId && categoryId !== 'all') {
    queryObject.categoryId = categoryId;
  }

  if (companyId && companyId !== 'all') {
    queryObject.companyId = companyId;
  }

  if (color && color !== 'all') {
    queryObject['colorStocks.color'] = color;
  }

  if (price) {
    queryObject.price = { $lte: Number(price) };
  }

  if (shipping) {
    queryObject.freeShipping = shipping;
  }

  if (text) {
    queryObject.$or = [
      { name: { $regex: text, $options: 'i' } },
      { description: { $regex: text, $options: 'i' } },
    ];
  }
  console.log(queryObject);

  // NO AWAIT
  let result = Product.find(queryObject)
    .populate('categoryId')
    .populate('companyId');

  // chain sort conditions
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
  if (sort === 'price-lowest') {
    result = result.sort('price');
  }
  if (sort === 'price-highest') {
    result = result.sort('-price');
  }
  if (sort === 'rating-lowest') {
    result = result.sort('averageRating');
  }
  if (sort === 'rating-highest') {
    result = result.sort('-averageRating');
  }

  // setup pagination
  const page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  limit = limit > 10 ? 10 : limit;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const products = await result;

  const totalProducts = await Product.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalProducts / limit);
  res.status(StatusCodes.OK).json({ products, totalProducts, numOfPages });
};

const getSingleProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId })
    .populate('reviews')
    .populate('categoryId')
    .populate('companyId');

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  await product.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Product removed' });
};

const uploadImage = async (req: Request, res: Response) => {
  if (!req.files) {
    throw new BadRequestError('No File Uploaded');
  }
  const productImage = req.files.image;
  if (!Array.isArray(productImage)) {
    if (!productImage.mimetype.startsWith('image')) {
      throw new BadRequestError('Please Upload Image');
    }

    const maxSize = 1024 * 1024;

    if (productImage.size > maxSize) {
      throw new BadRequestError('Please upload image smaller than 1MB');
    }

    const result = await cloudinaryV2.uploader.upload(
      productImage.tempFilePath,
      {
        folder: 'NTH-Store',
      },
    );
    fs.unlinkSync(productImage.tempFilePath);
    return res
      .status(StatusCodes.OK)
      .json({ image: { src: result.secure_url } });
  }
};

export {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
