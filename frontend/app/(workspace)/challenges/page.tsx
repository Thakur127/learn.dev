"use client";

import axiosInstance from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Badge } from "@/components/ui/badge";
import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import DifficultyTag from "@/components/DifficultyTag";
import MultiSelectCombobox from "@/components/MultipleSelectCombobox";
import BreadcrumPath from "@/components/BreadcrumPath";
import { Input } from "@/components/ui/input";
import { Challenge, Topic } from "@/types/challenges";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { getTopics } from "@/data-access/challenge";
import { Button } from "@/components/ui/button";

const LIMIT = 10;
const DEBOUNCETIME = 500; // in miliseconds

const Page = () => {
  const [challengeTitle, setChallengeTitle] = useState<string>(""); // The actual input value
  const [debouncedTitle, setDebouncedTitle] = useState<string>(""); // The debounced value
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]); // Selected topics

  // Infinite Query for fetching paginated challenges
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["challenge-available", debouncedTitle, selectedTopics],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await axiosInstance.get("/challenge/available", {
          params: {
            title: debouncedTitle,
            topics: selectedTopics.map((topic) => topic.name),
            offset: pageParam, // Start fetching from current page offset
            limit: LIMIT, // Set page size (adjust as needed)
          },
          paramsSerializer: (params) => {
            return Object.keys(params)
              .map((key) => {
                if (Array.isArray(params[key])) {
                  return params[key]
                    .map((item) => `${key}=${encodeURIComponent(item)}`)
                    .join("&");
                }
                return `${key}=${encodeURIComponent(params[key])}`;
              })
              .join("&");
          },
        });
        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.hasNext) return undefined; // Check if we reached the last page
        return allPages.length * LIMIT; // Otherwise, return the next offset
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const { data: topics } = useQuery({
    queryKey: ["challenge-topics"],
    queryFn: () => getTopics(),
  });

  // Debounce effect: set debouncedTitle after 500ms when challengeTitle changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitle(challengeTitle.trim());
    }, DEBOUNCETIME); // 500ms debounce

    return () => {
      clearTimeout(handler); // Clear timeout if the user types again before 500ms
    };
  }, [challengeTitle]);

  // Trigger loading more challenges when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        isFetchingNextPage ||
        !hasNextPage
      )
        return;
      fetchNextPage(); // Fetch more data when user reaches the bottom
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <MaxWidthWrapper>
      <div className="mb-4">
        <BreadcrumPath />
      </div>
      <div className="mb-4">
        <div className="w-full lg:w-1/2 relative space-y-2">
          <Input
            type="search"
            className="w-full rounded-full"
            placeholder="Search by title..."
            value={challengeTitle}
            onChange={(e) => setChallengeTitle(e.target.value)}
          />
          <MultiSelectCombobox
            values={topics || []}
            selectedValues={selectedTopics}
            setSelectedValues={setSelectedTopics}
            inputCommandPlaceholder="Select topics..."
            placeholderText="Filter by Topics"
            emptyCommandMessage="No topics found."
            className="w-fit"
            Icon={<Filter className="h-4 w-4 ml-2" />}
          />
        </div>
      </div>
      <div>{isPending && <div>Loading...</div>}</div>
      <>
        {data?.pages?.flatMap((page) => page).length !== 0 ? (
          <div>
            <ul className="space-y-2 list-none">
              {data?.pages?.map((challenges) =>
                challenges?.data?.map((challenge: Challenge) => (
                  <li key={challenge.id}>
                    <Card>
                      <CardHeader className="pb-1">
                        <CardTitle className="flex justify-between items-start gap-2">
                          <span className="flex flex-col">
                            <Link
                              href="/challenges/[slug]"
                              as={`/challenges/${challenge.slug}`}
                              className="text-lg no-underline capitalize"
                            >
                              {challenge.title}
                            </Link>
                            <span className="text-xs text-gray-500 font-normal">
                              {new Date(challenge.created_at).toUTCString()}
                            </span>
                          </span>
                          <DifficultyTag level={challenge.difficulty_tag}>
                            {challenge.difficulty_tag}
                          </DifficultyTag>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-1">
                        <span className="text-sm">
                          Contributed by:{" "}
                          <Link
                            href={"/user/[username]"}
                            as={`/user/${challenge.contributor.username}`}
                            className="no-underline text-primary font-medium"
                          >
                            {challenge.contributor.first_name}{" "}
                            {challenge.contributor.last_name}
                          </Link>
                        </span>
                        <div className="mt-2">
                          <ul className="list-none flex flex-wrap gap-1 md:gap-2">
                            {challenge.topic_tags.map((tag, idx) => (
                              <li key={idx}>
                                {selectedTopics.some(
                                  (topic) => topic.name === tag.name
                                ) ? (
                                  <Badge>{tag.name}</Badge>
                                ) : (
                                  <Badge variant={"secondary"}>
                                    {tag.name}
                                  </Badge>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))
              )}
            </ul>
            <div className="flex justify-center mt-4">
              {/* Load more indicator */}
              {isFetchingNextPage ? (
                <p>Loading more challenges...</p>
              ) : (
                hasNextPage && (
                  <Button variant={"outline"} onClick={() => fetchNextPage()}>
                    Load more
                  </Button>
                )
              )}
            </div>
          </div>
        ) : (
          <h1>No Challenge Found. But we will add in future for sure.</h1>
        )}
      </>
    </MaxWidthWrapper>
  );
};

export default Page;
