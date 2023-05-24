import mongoose, { Document, Schema, Types } from 'mongoose';
import User from './User';

export interface IAddress extends Document {
  name: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
  isDefault: boolean;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new mongoose.Schema<IAddress>(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: [1, 'Name must not contain only whitespace characters'],
      maxlength: 50,
    },
    mobile: {
      type: String,
      required: [true, 'Please provide phone number'],
      validate: {
        validator: function (value: string) {
          return /^[0-9]+$/.test(value);
        },
        message: 'Please provide a valid phone number',
      },
    },
    address: {
      type: String,
      required: [true, 'Please provide address'],
      minlength: [1, 'Address must not contain only whitespace characters'],
      maxlength: 50,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      minlength: [1, 'City must not contain only whitespace characters'],
      maxlength: 50,
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      minlength: [1, 'State must not contain only whitespace characters'],
      maxlength: 50,
    },
    stateCode: {
      type: String,
      required: [true, 'Please provide stateCode'],
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      minlength: [1, 'Country must not contain only whitespace characters'],
      maxlength: 50,
    },
    countryCode: {
      type: String,
      required: [true, 'Please provide countryCode'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async function (value: string) {
          try {
            const user = await User.findById(value);
            return user !== null;
          } catch (err) {
            return false;
          }
        },
        message: props => `${props.value} is not a valid user Id`,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export default mongoose.model<IAddress>('Address', AddressSchema);
