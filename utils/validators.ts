import Joi from 'joi';

export const userSignupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  birth_date: Joi.date().max('now').required(),
  password: Joi.string().min(6).required()
});

export const userSigninSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const expenseSchema = Joi.object({
  description: Joi.string().min(1).max(255).required(),
  amount: Joi.number().positive().precision(2).required(),
  reference_month: Joi.string().pattern(/^\d{4}-\d{2}$/).required()
});

export const limitSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  reference_month: Joi.string().pattern(/^\d{4}-\d{2}$/).required()
});

export const validateCurrentOrFutureMonth = (referenceMonth: string): boolean => {
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  return referenceMonth >= currentMonth;
};