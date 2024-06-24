import { Entity, Column, PrimaryGeneratedColumn,BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userid: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
