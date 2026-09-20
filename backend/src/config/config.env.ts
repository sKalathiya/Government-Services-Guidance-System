import Joi from 'joi';

export const envSchema = Joi.object({
  POSTGRES_USER: Joi.string().trim().min(1).required(),
  POSTGRES_PASSWORD: Joi.string().trim().min(1).required(),
  POSTGRES_DB: Joi.string().trim().min(1).required(),
  POSTGRES_HOST: Joi.string().hostname().required(),
  POSTGRES_PORT: Joi.number().port().default(5432),
  REDIS_PASSWORD: Joi.string().trim().min(1).required(),
  REDIS_HOST: Joi.string().hostname().required(),
  REDIS_PORT: Joi.number().port().default(6379),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
});
