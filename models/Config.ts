import mongoose, { Document, Schema } from 'mongoose';

interface IConfig extends Document {
  name: string;
  value: any;
  description: string;
  dataType: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConfigSchema = new mongoose.Schema<IConfig>(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Please provide name'],
      minlength: [1, 'Name must not contain only whitespace characters'],
      maxlength: 50,
    },
    value: {
      type: Schema.Types.Mixed,
      required: [true, 'Please provide value'],
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
    },
    dataType: {
      type: String,
      required: [true, 'Please provide dataType'],
      enum: ['String', 'Number', 'Boolean'],
    },
    status: { type: Boolean, required: [true, 'Please provide status'] },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ConfigSchema.pre('save', async function () {
  if (!this.isModified('dataType')) return;
  switch (this.dataType) {
    case 'Number':
      this.value = parseInt(this.value);
      break;
    case 'Boolean':
      this.value = Boolean(this.value);
    default:
      this.value = this.value.toString();
  }
});

export default mongoose.model<IConfig>('Config', ConfigSchema);
