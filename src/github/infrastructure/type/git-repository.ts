export interface GitRepository {
  name: string;
  fork: boolean;
  owner: {
    login: string;
  };
}
