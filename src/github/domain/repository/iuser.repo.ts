import { User } from '../aggregate_root/user';

export abstract class IUserRepo {
  abstract getUser(username: string): Promise<User>;
}
