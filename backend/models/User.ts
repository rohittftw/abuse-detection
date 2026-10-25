import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

UserSchema.methods.comparePassword = function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Never leak the hash if a document is serialized directly.
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const sanitized = ret as unknown as Record<string, unknown>;
    delete sanitized.passwordHash;
    delete sanitized.__v;
    return sanitized;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
