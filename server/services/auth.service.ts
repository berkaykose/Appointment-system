import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

const JWT_SECRET = useRuntimeConfig().jwtSecret;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (name: string, email: string, password: string) => {
  if (!emailRegex.test(email)) {
    throw new Error("Geçerli bir email adresi girin.");
  }
  if (password.length < 6) {
    throw new Error("Şifre en az 6 karakter olmalıdır.");
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('Bu email zaten kayıtlı.');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  return { user };
};

export const loginUser = async (email: string, password: string) => {
  if (!emailRegex.test(email)) {
    throw new Error("Geçerli bir email adresi girin.");
  }

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Email veya şifre hatalı.');
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

  return { user, token };
};
