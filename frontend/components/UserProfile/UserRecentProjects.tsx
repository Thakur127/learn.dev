"use client";

import { Check, CheckCheck, CodeXml, Timer, X } from "lucide-react";
import DifficultyTag from "../DifficultyTag";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { Button } from "../ui/button";

const UserRecentProjects = ({ challenges }: { challenges: any }) => {
  // console.log(challenges);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Latest coding challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {challenges.map((challenge: any, index: number) => (
                <li
                  key={challenge.id}
                  className="flex items-start justify-between border shadow-md p-4 rounded-md"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <CodeXml />
                      <div>
                        <Link
                          href={`/challenges/${challenge.slug}`}
                          className="flex gap-2 items-center"
                        >
                          <span
                            className={cn(
                              "p-1 rounded-full",
                              challenge.status === "pending"
                                ? "bg-yellow-200 text-yellow-600"
                                : challenge.status === "submitted"
                                ? "bg-gray-200 text-gray-600"
                                : challenge.status === "accepted"
                                ? "bg-green-200 text-green-600"
                                : "bg-red-200 text-red-600"
                            )}
                          >
                            {challenge.status === "pending" ? (
                              <Timer className="w-4 h-4" />
                            ) : challenge.status === "submitted" ? (
                              <Check className="w-4 h-4" />
                            ) : challenge.status === "accepted" ? (
                              <CheckCheck className="w-4 h-4" />
                            ) : (
                              challenge.status === "rejected" && (
                                <X className="w-4 h-4" />
                              )
                            )}
                          </span>
                          <p className="font-medium">{challenge.title}</p>
                        </Link>
                        <div className="text-sm text-muted-foreground space-x-2 mt-2">
                          {challenge.topic_tags.map((topic: any) => {
                            return (
                              <Badge variant="secondary" key={topic.id}>
                                {topic.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      {challenge?.github_url && (
                        <Button asChild size={"sm"} variant={"ghost"}>
                          <Link
                            href={challenge.github_url}
                            target="_blank"
                            className="text-sm font-medium text-muted-foreground"
                          >
                            View on GitHub
                          </Link>
                        </Button>
                      )}
                      {challenge?.presentation_video_url && (
                        <Button
                          asChild
                          size={"sm"}
                          variant={"ghost"}
                          className="text-sm font-medium text-muted-foreground"
                        >
                          <Link
                            href={challenge.presentation_video_url}
                            target="_blank"
                            className="text-sm font-medium text-muted-foreground"
                          >
                            Watch Presentation
                          </Link>
                        </Button>
                      )}
                      {challenge?.deployed_application_url && (
                        <Button
                          asChild
                          size={"sm"}
                          variant={"ghost"}
                          className="text-sm font-medium text-muted-foreground"
                        >
                          <Link
                            href={challenge.deployed_application_url}
                            target="_blank"
                            className="text-sm font-medium text-muted-foreground"
                          >
                            Deployed Application
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  <DifficultyTag level={challenge.difficulty_tag}>
                    {challenge.difficulty_tag}
                  </DifficultyTag>
                </li>
              ))}
              {challenges.length === 0 && <li>No Challenges Taken yet</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
};
export default UserRecentProjects;
