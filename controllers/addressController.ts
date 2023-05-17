import Address, { IAddress } from '../models/Address';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors';
import { checkPermissions } from '../utils';

const createAddress = async (req: Request, res: Response) => {
  const { isDefault } = req.body;

  req.body.userId = req.user.id;
  const address = await Address.create(req.body);

  if (isDefault) {
    await setDefaultAddress(address, req.body.userId);
  }

  res.status(StatusCodes.CREATED).json({ address });
};

async function setDefaultAddress(address: IAddress, userId: string) {
  const existingDefaultAddress = await Address.findOne({
    userId,
    isDefault: true,
  });

  if (existingDefaultAddress) {
    existingDefaultAddress.isDefault = false;
    existingDefaultAddress.markModified('isDefault');
    await existingDefaultAddress.save();
  }

  address.isDefault = true;
  address.markModified('isDefault');
  await address.save();
}

const getAllAddresses = async (req: Request, res: Response) => {
  const addresss = await Address.find({});
  res.status(StatusCodes.OK).json({ addresss, count: addresss.length });
};

const getCurrentUserAddresses = async (req: Request, res: Response) => {
  const addresses = await Address.find({ userId: req.user.id }).sort(
    '-createdAt',
  );
  res.status(StatusCodes.OK).json({ addresses, count: addresses.length });
};

const getSingleAddress = async (req: Request, res: Response) => {
  const { id: addressId } = req.params;

  const address = await Address.findOne({ _id: addressId });

  if (!address) {
    throw new NotFoundError(`No address with id: ${addressId}`);
  }

  res.status(StatusCodes.OK).json({ address });
};

const updateAddress = async (req: Request, res: Response) => {
  const { id: addressId } = req.params;
  const { isDefault } = req.body;
  let address = await Address.findOne({ _id: addressId });

  if (!address) {
    throw new NotFoundError(`No address with id: ${addressId}`);
  }

  checkPermissions(req.user, address.userId);

  address = await Address.findOneAndUpdate({ _id: addressId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (isDefault) {
    await setDefaultAddress(address!, req.user.id);
  }

  res.status(StatusCodes.OK).json({ address });
};

const deleteAddress = async (req: Request, res: Response) => {
  const { id: addressId } = req.params;

  const address = await Address.findOne({ _id: addressId });

  if (!address) {
    throw new NotFoundError(`No address with id: ${addressId}`);
  }

  checkPermissions(req.user, address.userId);

  await address.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Address removed' });
};

export {
  createAddress,
  getAllAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  getCurrentUserAddresses,
};
