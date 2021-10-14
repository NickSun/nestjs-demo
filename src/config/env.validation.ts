import { plainToClass } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, validateSync } from 'class-validator';
import { LogLevel } from './log-level.enum';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values<string>(LogLevel))
  LOG_LEVEL: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
