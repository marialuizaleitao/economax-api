import { Request, Response } from 'express';
import { getConnection } from '../database/connection';
import { limitSchema, validateCurrentOrFutureMonth } from '../utils/validators';
import { Limit } from '../types';

export const createLimit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = limitSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { amount, reference_month } = value;
    const userId = (req as any).userId;

    // Validate month is current or future
    if (!validateCurrentOrFutureMonth(reference_month)) {
      res.status(400).json({ error: 'Não é possível criar limites para meses anteriores' });
      return;
    }

    const connection = getConnection();

    try {
      const [result] = await connection.execute(
        'INSERT INTO limits (user_id, amount, reference_month) VALUES (?, ?, ?)',
        [userId, amount, reference_month]
      );

      res.status(201).json({
        message: 'Limite criado com sucesso',
        limit: {
          id: (result as any).insertId,
          amount,
          reference_month
        }
      });
    } catch (dbError: any) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'Já existe um limite para este mês' });
        return;
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Create limit error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getLimits = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { month } = req.query;
    const connection = getConnection();

    let query = 'SELECT * FROM limits WHERE user_id = ?';
    const params: any[] = [userId];

    if (month) {
      query += ' AND reference_month = ?';
      params.push(month);
    }

    query += ' ORDER BY reference_month DESC';

    const [limits] = await connection.execute(query, params);

    res.json({ limits });
  } catch (error) {
    console.error('Get limits error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateLimit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, value } = limitSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { amount, reference_month } = value;
    const userId = (req as any).userId;

    // Validate month is current or future
    if (!validateCurrentOrFutureMonth(reference_month)) {
      res.status(400).json({ error: 'Não é possível editar limites para meses anteriores' });
      return;
    }

    const connection = getConnection();

    // Check if limit exists and belongs to user
    const [existingLimits] = await connection.execute(
      'SELECT reference_month FROM limits WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const existingLimit = (existingLimits as Limit[])[0];

    if (!existingLimit) {
      res.status(404).json({ error: 'Limite não encontrado' });
      return;
    }

    // Validate existing limit month
    if (!validateCurrentOrFutureMonth(existingLimit.reference_month)) {
      res.status(400).json({ error: 'Não é possível editar limites de meses anteriores' });
      return;
    }

    try {
      const [result] = await connection.execute(
        'UPDATE limits SET amount = ?, reference_month = ? WHERE id = ? AND user_id = ?',
        [amount, reference_month, id, userId]
      );

      if ((result as any).affectedRows === 0) {
        res.status(404).json({ error: 'Limite não encontrado' });
        return;
      }

      res.json({
        message: 'Limite atualizado com sucesso',
        limit: {
          id: parseInt(id),
          amount,
          reference_month
        }
      });
    } catch (dbError: any) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'Já existe um limite para este mês' });
        return;
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Update limit error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteLimit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const connection = getConnection();

    // Check if limit exists and belongs to user
    const [existingLimits] = await connection.execute(
      'SELECT reference_month FROM limits WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const existingLimit = (existingLimits as Limit[])[0];

    if (!existingLimit) {
      res.status(404).json({ error: 'Limite não encontrado' });
      return;
    }

    // Validate existing limit month
    if (!validateCurrentOrFutureMonth(existingLimit.reference_month)) {
      res.status(400).json({ error: 'Não é possível excluir limites de meses anteriores' });
      return;
    }

    const [result] = await connection.execute(
      'DELETE FROM limits WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ error: 'Limite não encontrado' });
      return;
    }

    res.json({ message: 'Limite excluído com sucesso' });
  } catch (error) {
    console.error('Delete limit error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};