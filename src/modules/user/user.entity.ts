import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { PollEntity } from '@modules/poll/poll.entity';

@Entity('user')
export class UserEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Vital' })
  @Column()
  name: string;

  @ApiProperty({ example: 'vital@mail' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: '11111111' })
  @Column()
  password: string;

  @ApiProperty({ example: '2025-02-24T15:43:31.838Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-02-24T15:43:31.838Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1N', type: 'string', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;

  @ApiProperty({
    example: [
      {
        id: 1,
        title: 'Super poll',
        description: 'Super description',
        createdAt: '2025-02-24T15:43:31.838Z',
        updatedAt: '2025-02-24T15:43:31.838Z',
        closedAt: null,
        status: 'ACTIVE',
        author: { id: 1 },
        questions: [{ id: 1, text: 'Question 1', answers: [{ id: 1, text: 'Answer 1' }] }],
      },
    ],
    type: () => [PollEntity],
  })
  @OneToMany(() => PollEntity, poll => poll.author, { cascade: true })
  polls: PollEntity[];
}
