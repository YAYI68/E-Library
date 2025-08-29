import { IsInt, IsOptional, Max, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDto {
  
 @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsString()
  q: string;
    
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

 

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit: number = 10;
}