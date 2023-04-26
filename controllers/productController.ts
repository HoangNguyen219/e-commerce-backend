import Product from '../models/Product';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors';
import fs from 'fs';
import cloudinary from 'cloudinary';

const cloudinaryV2 = cloudinary.v2;

const createProduct = async (req: Request, res: Response) => {
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req: Request, res: Response) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req: Request, res: Response) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId }).populate('reviews');

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

    const result = await cloudinaryV2.uploader.upload(productImage.tempFilePath, {
      folder: 'NTH-Store',
    });
    fs.unlinkSync(productImage.tempFilePath);
    return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
  }
};

export { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage };
