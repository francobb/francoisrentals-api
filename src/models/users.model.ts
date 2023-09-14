import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['OWNER', 'ADMIN', 'TENANT'],
  },
  resetTokenExpires: {
    type: Date,
    required: false,
  },
  resetToken: {
    type: String,
    required: false,
  },
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
