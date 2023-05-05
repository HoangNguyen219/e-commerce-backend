import mongoose, { Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

export interface ITokenUser {
  id: string;
  name: string;
  role: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: 3,
      maxlength: 50,
      unique: true,
      validate: {
        validator: function (value: string) {
          return /^[a-zA-Z][a-zA-Z0-9 ]*$/.test(value);
        },
        message:
          'Please provide a valid name that starts with a letter and contains no special characters',
      },
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide email'],
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: 'Please provide valid email',
      },
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      validate: {
        validator: (value: string) => {
          return validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
          });
        },
        message:
          'Password must have at least 8 characters, one lowercase letter, one uppercase letter and one number',
      },
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true },
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
  canditatePassword: string,
) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

export default mongoose.model<IUser>('User', UserSchema);
