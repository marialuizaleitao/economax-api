import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from '../database/connection';
import { userSignupSchema, userSigninSchema } from '../../utils/validators';
import { User } from '../../types';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = userSignupSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { name, email, birth_date, password } = value;
    const connection = getConnection();

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, birth_date, password) VALUES (?, ?, ?, ?)',
      [name, email, birth_date, hashedPassword]
    );

    const userId = (result as any).insertId;

    // Generate token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: userId,
        name,
        email,
        birth_date
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = userSigninSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { email, password } = value;
    const connection = getConnection();

    // Find user
    const [users] = await connection.execute(
      'SELECT id, name, email, birth_date, password FROM users WHERE email = ?',
      [email]
    );

    const user = (users as User[])[0];

    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birth_date: user.birth_date
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const connection = getConnection();

    const [users] = await connection.execute(
      'SELECT id, name, email, birth_date FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as User[])[0];

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};