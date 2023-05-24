import mongoose, { Document, Types, Schema } from 'mongoose';
import Review from './Review';
import Company from './Company';
import Category from './Category';

export interface IColorStock extends Document {
  color: string;
  stock: Number;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  primaryImage: string;
  secondaryImages: string[];
  colorStocks: [IColorStock];
  featured: boolean;
  averageRating: number;
  numOfReviews: number;
  categoryId: Schema.Types.ObjectId;
  companyId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ColorStockSchema = new mongoose.Schema<IColorStock>({
  color: {
    type: String,
    required: true,
    enum: [
      'black',
      'white',
      'gray',
      'brown',
      'red',
      'purple',
      'green',
      'olive',
      'yellow',
      'navy',
      'blue',
    ],
  },
  stock: {
    type: Number,
    required: true,
    default: 15,
    min: [0, 'Stock can not be negative'],
  },
});

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      require: [true, 'Please provide product name'],
      maxLength: [100, 'Name can not be more than 100 characters'],
      minlength: [1, 'Name must not contain only whitespace characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price can not be negative'],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
      minlength: [1, 'Description must not contain only whitespace characters'],
    },
    primaryImage: {
      type: String,
      required: true,
    },
    secondaryImages: {
      type: [String],
      default: [],
    },
    colorStocks: {
      type: [ColorStockSchema],
      required: true,
      validate: {
        validator: function (value: IColorStock[]): boolean {
          const uniqueColors = new Set(
            value.map(colorStock => colorStock.color),
          );
          return uniqueColors.size === value.length;
        },
        message: `Duplicate color in product colorStock`,
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    companyId: {
      type: Types.ObjectId,
      ref: 'Company',
      required: true,
      validate: {
        validator: async function (value: string) {
          try {
            const company = await Company.findById(value);
            return company !== null;
          } catch (err) {
            return false;
          }
        },
        message: props => `${props.value} is not a valid company Id`,
      },
    },
    categoryId: {
      type: Types.ObjectId,
      ref: 'Category',
      required: true,
      validate: {
        validator: async function (value: string) {
          try {
            const category = await Category.findById(value);
            return category !== null;
          } catch (err) {
            return false;
          }
        },
        message: props => `${props.value} is not a valid category Id`,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId',
  justOne: false,
});

ProductSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function () {
    await Review.deleteMany({ productId: this._id });
  },
);
export default mongoose.model<IProduct>('Product', ProductSchema);
