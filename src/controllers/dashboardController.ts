import { Request, Response } from 'express';
import { getConnection } from '../database/connection';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { month } = req.query;
    const connection = getConnection();

    const targetMonth = month as string ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    // Get expenses for the month
    const [expenses] = await connection.execute(
      'SELECT SUM(amount) as total_expenses FROM expenses WHERE user_id = ? AND reference_month = ?',
      [userId, targetMonth]
    );

    // Get limit for the month
    const [limits] = await connection.execute(
      'SELECT amount FROM limits WHERE user_id = ? AND reference_month = ?',
      [userId, targetMonth]
    );

    const totalExpenses = (expenses as any[])[0]?.total_expenses || 0;
    const monthLimit = (limits as any[])[0]?.amount || null;

    // Determine if month is completed (past month)
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const isCompletedMonth = targetMonth < currentMonth;

    let feedback = {
      type: 'no_limit',
      message: 'Nenhum limite foi registrado para este mês',
      showAddLimitButton: true
    };

    if (monthLimit !== null) {
      const savedAmount = monthLimit - totalExpenses;
      const isWithinLimit = totalExpenses <= monthLimit;

      if (isCompletedMonth) {
        if (isWithinLimit) {
          feedback = {
            type: 'success',
            message: `Parabéns! Você economizou R$ ${savedAmount.toFixed(2)} este mês!`,
            showAddLimitButton: false
          };
        } else {
          feedback = {
            type: 'exceeded',
            message: `Você ultrapassou o limite em R$ ${Math.abs(savedAmount).toFixed(2)}. Tente economizar mais no próximo mês!`,
            showAddLimitButton: false
          };
        }
      } else {
        if (isWithinLimit) {
          feedback = {
            type: 'on_track',
            message: `Você está no caminho certo! Ainda pode gastar R$ ${savedAmount.toFixed(2)} este mês.`,
            showAddLimitButton: false
          };
        } else {
          feedback = {
            type: 'over_limit',
            message: `Atenção! Você já ultrapassou o limite em R$ ${Math.abs(savedAmount).toFixed(2)}.`,
            showAddLimitButton: false
          };
        }
      }
    }

    const progressPercentage = monthLimit ? Math.min((totalExpenses / monthLimit) * 100, 100) : 0;

    res.json({
      month: targetMonth,
      totalExpenses: parseFloat(totalExpenses),
      limit: monthLimit ? parseFloat(monthLimit) : null,
      progressPercentage,
      isCompletedMonth,
      feedback
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};