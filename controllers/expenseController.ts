import { Request, Response } from 'express';
import { getConnection } from '../database/connection';
import { expenseSchema, validateCurrentOrFutureMonth } from '../utils/validators';
import { Expense } from '../types';

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = expenseSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { description, amount, reference_month } = value;
    const userId = (req as any).userId;

    // Validate month is current or future
    if (!validateCurrentOrFutureMonth(reference_month)) {
      res.status(400).json({ error: 'Não é possível criar despesas para meses anteriores' });
      return;
    }

    const connection = getConnection();

    const [result] = await connection.execute(
      'INSERT INTO expenses (user_id, description, amount, reference_month) VALUES (?, ?, ?, ?)',
      [userId, description, amount, reference_month]
    );

    res.status(201).json({
      message: 'Despesa criada com sucesso',
      expense: {
        id: (result as any).insertId,
        description,
        amount,
        reference_month
      }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { month } = req.query;
    const connection = getConnection();

    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params: any[] = [userId];

    if (month) {
      query += ' AND reference_month = ?';
      params.push(month);
    }

    query += ' ORDER BY created_at DESC';

    const [expenses] = await connection.execute(query, params);

    res.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, value } = expenseSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { description, amount, reference_month } = value;
    const userId = (req as any).userId;

    // Validate month is current or future
    if (!validateCurrentOrFutureMonth(reference_month)) {
      res.status(400).json({ error: 'Não é possível editar despesas para meses anteriores' });
      return;
    }

    const connection = getConnection();

    // Check if expense exists and belongs to user
    const [existingExpenses] = await connection.execute(
      'SELECT reference_month FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const existingExpense = (existingExpenses as Expense[])[0];

    if (!existingExpense) {
      res.status(404).json({ error: 'Despesa não encontrada' });
      return;
    }

    // Validate existing expense month
    if (!validateCurrentOrFutureMonth(existingExpense.reference_month)) {
      res.status(400).json({ error: 'Não é possível editar despesas de meses anteriores' });
      return;
    }

    const [result] = await connection.execute(
      'UPDATE expenses SET description = ?, amount = ?, reference_month = ? WHERE id = ? AND user_id = ?',
      [description, amount, reference_month, id, userId]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ error: 'Despesa não encontrada' });
      return;
    }

    res.json({
      message: 'Despesa atualizada com sucesso',
      expense: {
        id: parseInt(id),
        description,
        amount,
        reference_month
      }
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const connection = getConnection();

    // Check if expense exists and belongs to user
    const [existingExpenses] = await connection.execute(
      'SELECT reference_month FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const existingExpense = (existingExpenses as Expense[])[0];

    if (!existingExpense) {
      res.status(404).json({ error: 'Despesa não encontrada' });
      return;
    }

    // Validate existing expense month
    if (!validateCurrentOrFutureMonth(existingExpense.reference_month)) {
      res.status(400).json({ error: 'Não é possível excluir despesas de meses anteriores' });
      return;
    }

    const [result] = await connection.execute(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ error: 'Despesa não encontrada' });
      return;
    }

    res.json({ message: 'Despesa excluída com sucesso' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};