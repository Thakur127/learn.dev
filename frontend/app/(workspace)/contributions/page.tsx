"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/lib/axios";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Suspense } from "react";
import Link from "next/link";
import DifficultyTag from "@/components/DifficultyTag";
import { Badge } from "@/components/ui/badge";
import ContributeChallengeButton from "@/components/Challenge/ContributeChallengeButton";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Challenge } from "@/types/challenges";
import { Check, Timer, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ApprovalStatus = "pending" | "approved" | "rejected";

type ContributedChallenge = {
  approval: ApprovalStatus;
} & Challenge;

function Page() {
  const { data: session } = useSession();

  const { data: challenges } = useSuspenseQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ContributedChallenge[]>(
        "/challenge/your-contributions",
        {
          headers: {
            Authorization: "Bearer " + session?.accessToken,
          },
        }
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (!challenges) {
    return <div>Loading...</div>;
  }

  if (challenges.length === 0) {
    return (
      <MaxWidthWrapper>
        <div className="flex mt-4 lg:mt-12">
          <div className="max-w-3xl m-auto">
            <h1 className="text-xl text-center">
              You have not Contributed any challenges yet, but you can now
            </h1>
            <p className="text-gray-600 text-center">
              We would appreciate you contributing the challenges, it can help
              tens, hundreds, thousands, or even millions of developers to
              increase their skills
            </p>
            <div className="flex justify-center mt-12">
              <ContributeChallengeButton text={"Contribute"} />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper>
      <Suspense fallback={"Loading..."}>
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl">Your Contributions: {challenges.length}</h1>
            <ContributeChallengeButton text={"Contribute More"} />
          </div>
          <p className="text-gray-600 mt-4 lg:mt-2">
            We appreciate your efforts, your contributions helping others to
            build their skills.
          </p>
        </div>
        <div>
          <Card className="mb-4">
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li className="flex gap-2 items-center">
                  <span className="p-1 rounded-full bg-yellow-200 text-yellow-600 block">
                    <Timer className="w-4 h-4" />
                  </span>
                  : Pending Status
                </li>
                <li className="flex gap-2 items-center">
                  <span className="p-1 rounded-full bg-green-200 text-green-600">
                    <Check className="w-4 h-4" />
                  </span>
                  : Approved Status
                </li>
                <li className="flex gap-2 items-center">
                  <span className="p-1 rounded-full bg-red-200 text-red-600">
                    <X className="w-4 h-4" />
                  </span>
                  : Rejected Status
                </li>
              </ul>
            </CardContent>
          </Card>
          <ul className="space-y-4 list-none">
            {challenges?.map((challenge: ContributedChallenge, idx: number) => {
              return (
                <li key={idx}>
                  <Card>
                    <CardHeader className="pb-1">
                      <CardTitle className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-2">
                          <span
                            className={cn(
                              "p-1 rounded-full flex items-center justify-center",
                              challenge.approval === "pending"
                                ? "bg-yellow-200 text-yellow-600"
                                : challenge.approval === "approved"
                                ? "bg-green-200 text-green-600"
                                : "bg-red-200 text-red-600"
                            )}
                          >
                            {challenge.approval === "pending" ? (
                              <Timer className="w-4 h-4" />
                            ) : challenge.approval === "approved" ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </span>

                          <span className="flex flex-col">
                            <Link
                              href="/challenges/[slug]"
                              as={`/challenges/${challenge.slug}`}
                              className="text-lg no-underline capitalize "
                            >
                              <h3>{challenge.title}</h3>
                            </Link>
                            <span className="text-xs text-gray-500 font-normal">
                              {new Date(challenge.created_at).toUTCString()}
                            </span>
                          </span>
                        </div>
                        <DifficultyTag level={challenge.difficulty_tag}>
                          {challenge.difficulty_tag}
                        </DifficultyTag>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                      {/* <span className="text-sm">
                          Contributed by:{" "}
                          <Link
                            href={"/user/[username]"}
                            as={`/user/${challenge.contributor.username}`}
                            className="no-underline text-primary font-medium"
                          >
                            {challenge.contributor.first_name}{" "}
                            {challenge.contributor.last_name}
                          </Link>
                        </span> */}
                      <div className="mt-2">
                        <ul className="list-none flex wrap space-x-1">
                          {challenge.topic_tags.map((tag, idx) => {
                            return (
                              <li key={idx}>
                                <Badge variant={"secondary"}>{tag.name}</Badge>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      </Suspense>
    </MaxWidthWrapper>
  );
}
export default Page;
