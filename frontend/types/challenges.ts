export type Topic = {
  id: string;
  name: string;
};

export enum DifficultyTag {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCE = "advance",
  EXPERT = "expert",
}

export type Challenge = {
  id: string;
  title: string;
  slug: string;
  difficulty_tag: DifficultyTag;
  description?: string;
  topic_tags: {
    id: string;
    name: string;
  }[];
  contributor: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
};


export enum TakenChallengeStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  SUBMITTED = "submitted",
}

export type AcceptedChallenge = {
  user_id: string;
  challenge_id: string;
  status: TakenChallengeStatus;
  created_at: Date;
  updated_at: Date;
};

