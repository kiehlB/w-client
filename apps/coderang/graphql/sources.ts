export interface Source {
  __typename?: string;
  id?: string;
  name: string;
  image: string;
  handle: string;
  public: boolean;
  headerImage?: string;
  color?: string;
  description?: string;
}

export interface Squad extends Source {
  active: boolean;
  permalink: string;
  public: boolean;
  membersCount: number;
  description: string;
  referralUrl?: string;
  banner?: string;
  borderColor?: string;
}
