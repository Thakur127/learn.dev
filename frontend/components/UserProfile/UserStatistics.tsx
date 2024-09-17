"use client";

import { BookOpen, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMemo, memo } from "react";

interface Challenge {
  id: string;
  title: string;
  status: "pending" | "accepted" | "rejected" | "submitted";
  difficulty_tag: "beginner" | "medium" | "advance" | "expert";
  topic_tags: { id: string; name: string }[];
}

const UserStatistics = ({ challenges }: { challenges: Challenge[] }) => {
  // list of completed challenges
  const completedChallenges = useMemo(
    () =>
      challenges.filter(
        (challenge: Challenge) => challenge.status === "accepted"
      ),
    [challenges]
  );

  // list of unique topics
  const topics = useMemo(() => {
    return Array.from(
      new Set(
        completedChallenges.flatMap((challenge: Challenge) =>
          challenge.topic_tags.map((topic: any) => topic.name)
        )
      )
    );
  }, [completedChallenges]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around">
          <div className="text-center">
            <Trophy className="w-8 h-8 mx-auto text-yellow-500" />
            <p className="mt-2 text-2xl font-bold">
              {completedChallenges.length}
            </p>
            <p className="text-sm text-muted-foreground">Projects Completed</p>
          </div>
          <div className="text-center">
            <BookOpen className="w-8 h-8 mx-auto text-blue-500" />
            <p className="mt-2 text-2xl font-bold">{topics.length}</p>
            <p className="text-sm text-muted-foreground">
              Technologies Learned
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default memo(UserStatistics);
