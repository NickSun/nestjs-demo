export interface GitBranch {
  name: string;
  commit: {
    sha: string;
  };
}
