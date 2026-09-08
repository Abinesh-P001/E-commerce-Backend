import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/responseFormatter.js';
import { sendWelcomeEmail } from '../utils/emailService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', 'VALIDATION_ERROR', 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Please provide a valid email address.', 'VALIDATION_ERROR', 400);
    }

    // Basic password complexity validation
    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long.', 'VALIDATION_ERROR', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 'A user with this email address already exists.', 'EMAIL_EXISTS', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const assignedRole = process.env.INITIAL_ADMIN_EMAIL === email.toLowerCase() ? 'ADMIN' : 'CUSTOMER';

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        role: assignedRole,
        cart: {
          create: {},
        },
        wishlist: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    // Fire off welcome email asynchronously
    sendWelcomeEmail(user.email, user.name);

    const token = generateToken({ id: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return sendSuccess(
      res,
      'Registration successful. Welcome to DairyFresh!',
      {
        user,
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

const authenticateUser = async (req, res, next, isAdminLogin = false) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(
        res,
        `Please provide both ${isAdminLogin ? 'administrator ' : ''}email and password.`,
        'VALIDATION_ERROR',
        400
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    const invalidMsg = isAdminLogin ? 'Invalid administrator credentials.' : 'Invalid email or password.';

    if (!user) {
      return sendError(res, invalidMsg, 'INVALID_CREDENTIALS', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, invalidMsg, 'INVALID_CREDENTIALS', 401);
    }

    if (isAdminLogin && user.role !== 'ADMIN') {
      return sendError(res, 'Access denied. You do not have administrator privileges.', 'FORBIDDEN', 403);
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, isAdminLogin ? 'Administrator authenticated successfully.' : 'Login successful.', {
      user: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = (req, res, next) => authenticateUser(req, res, next, false);

export const adminLogin = (req, res, next) => authenticateUser(req, res, next, true);

export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return sendSuccess(res, 'Logged out successfully.');
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
        cart: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    discountPrice: true,
                    mainImage: true,
                    stock: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found.', 'USER_NOT_FOUND', 404);
    }

    return sendSuccess(res, 'User profile fetched successfully.', { user });
  } catch (error) {
    next(error);
  }
};
