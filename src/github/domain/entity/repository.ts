import { Branch } from './branch';

export class Repository {
  public constructor(
    private readonly name: string,
    private readonly ownerLogin: string,
    private branches: Branch[] = [],
  ) {}

  public getName(): string {
    return this.name;
  }

  public setBranches(branches: Branch[]) {
    this.branches = branches;

    return this;
  }
}
