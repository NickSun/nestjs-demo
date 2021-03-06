import { Repository } from '../entity/repository';

export class User {
  private repos: Repository[];

  public constructor(private login: string, private isOrg: boolean) {}

  public isOrganization(): boolean {
    return this.isOrg;
  }

  public getLogin(): string {
    return this.login;
  }

  public setRepos(repos: Repository[]) {
    this.repos = repos;
  }

  public getRepos(): Repository[] {
    return this.repos;
  }
}
