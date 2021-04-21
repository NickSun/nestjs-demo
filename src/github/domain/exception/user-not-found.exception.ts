export class UserNotFoundException {
  private readonly status: number = 404;

  private readonly message: string = 'User Not Found';

  public getStatus(): number {
    return this.status;
  }

  public getMessage(): string {
    return this.message;
  }
}
