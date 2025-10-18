import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { createUserSchema, updateUserSchema } from '../validators/userValidator';
import { AuthRequest } from '../middleware/auth';

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const { name, email, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    if ((error as any).kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid user ID format' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    if (value.password) {
      const saltRounds = 10;
      value.password = await bcrypt.hash(value.password, saltRounds);
    }

    if (value.email) {
      const existingUser = await User.findOne({ email: value.email, _id: { $ne: id } });
      if (existingUser) {
        res.status(409).json({ message: 'Email already in use' });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if ((error as any).kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid user ID format' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if ((error as any).kind === 'ObjectId') {
      res.status(400).json({ message: 'Invalid user ID format' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
