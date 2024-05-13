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

export interface SourceMember {
  role: SourceMemberRole;
  user: any;
  source: Squad;
  referralToken: string;
  permissions?: any[];
  flags?: any;
}

export enum SourceMemberRole {
  Member = 'member',
  Moderator = 'moderator',
  Admin = 'admin',
  Blocked = 'blocked',
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
