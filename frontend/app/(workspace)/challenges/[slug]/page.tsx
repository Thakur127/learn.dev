"use client";

import DifficultyTag from "@/components/DifficultyTag";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import RenderMarkdown from "@/components/RenderMarkdown";
import TakeChallengeButton from "@/components/Challenge/TakeChallengeButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import axiosInstance from "@/lib/axios";
import { CalendarDays, Users } from "lucide-react";
import Link from "next/link";
import ChallengeStatusButton from "@/components/Challenge/ChallengeStatusButton";
import { QueryClient, useQuery } from "@tanstack/react-query";
import Submission from "@/components/Challenge/Submission";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import BreadcrumPath from "@/components/BreadcrumPath";
import { AcceptedChallenge, Challenge } from "@/types/challenges";
import { takenChallengeInfo } from "@/data-access/challenge";

const Page = ({ params }: { params: any }) => {
  const { data: session, status } = useSession();
  const queryClient = new QueryClient();

  const { data: challenge, isPending } = useQuery({
    queryKey: ["challenge", params.slug],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        challenge: Challenge;
        accepted_challenge: AcceptedChallenge;
      }>(`challenge/view/${params.slug}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      queryClient.prefetchQuery({
        queryKey: ["taken-challenge-info", data.challenge.id],
        queryFn: () => takenChallengeInfo(data.challenge.id),
        staleTime: 1000 * 60 * 30,
      });

      return {
        ...data.challenge,
        accepted_challenge: data.accepted_challenge,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isPending) {
    return (
      <MaxWidthWrapper>
        <h1>Loading...</h1>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper>
      <div className="mb-4">
        <BreadcrumPath />
      </div>
      {challenge && (
        <Suspense fallback={"Loading..."}>
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                <DifficultyTag level={challenge.difficulty_tag}>
                  {challenge.difficulty_tag}
                </DifficultyTag>
                {challenge.topic_tags.map((tag) => (
                  <Badge variant={"secondary"} key={tag.id}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            {challenge.accepted_challenge ? (
              <ChallengeStatusButton
                text={`Submission ${challenge.accepted_challenge.status}`}
                status={challenge.accepted_challenge.status}
                challengeId={challenge.id}
                challengeTitle={challenge.title}
              />
            ) : (
              <TakeChallengeButton
                text="Take Challenge 😎"
                challengeId={challenge.id}
              />
            )}
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
              {/* <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  {challenge?.description && (
                    <RenderMarkdown content={challenge.description} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Challenge Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      Created: {new Date(challenge.created_at).toUTCString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      Last Updated:{" "}
                      {new Date(challenge.updated_at).toUTCString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      Contributor:{" "}
                      <Link
                        href={`/user/${challenge.contributor.username}`}
                        className="no-underline text-primary font-medium"
                      >
                        {challenge.contributor.first_name}{" "}
                        {challenge.contributor.last_name}
                      </Link>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guidelines" className="space-y-4">
              <Submission />
            </TabsContent>

            {/* <TabsContent value="leaderboard" className="space-y-4">
              <Leaderboard />
            </TabsContent> */}
          </Tabs>
        </Suspense>
      )}
    </MaxWidthWrapper>
  );
};

export default Page;
