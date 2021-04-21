import { Branch } from './branch';

export class Repository {
  public constructor(
    private name: string,
    private ownerLogin: string,
    private branches: Branch[] = [],
  ) {}

  public getName(): string {
    return this.name;
  }

  public setBranches(branches: Branch[]) {
    this.branches = branches;
  }
}
