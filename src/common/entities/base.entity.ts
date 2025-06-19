import { PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;
}
