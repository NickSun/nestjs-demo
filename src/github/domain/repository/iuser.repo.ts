import { Observable } from 'rxjs';
import { Repository } from '../entity/repository';

export abstract class IUserRepo {
  abstract getUserRepos(username: string): Observable<Repository[]>;
}
