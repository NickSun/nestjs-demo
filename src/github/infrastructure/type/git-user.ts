import { UserTypeEnum } from './user-type.enum';

export interface GitUser {
  login: string;
  type: UserTypeEnum;
}
