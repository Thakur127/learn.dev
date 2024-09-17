"use client";

import { Card, CardContent } from "../ui/card";
import {
  CalendarIcon,
  EllipsisVertical,
  GlobeIcon,
  Share2,
  User2,
} from "lucide-react";
import { Button } from "../ui/button";
import UserStatistics from "./UserStatistics";
import UserRecentProjects from "./UserRecentProjects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import axiosInstance from "@/lib/axios";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import EditProfileDialog from "./EditProfileDialog";

const UserProfile = ({ user }: { user: any }) => {
  const { data: session, status, update } = useSession();
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] =
    useState<boolean>(false);

  const { data: takenChallenges } = useQuery({
    queryKey: ["user", user.username],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/challenge/${user.username}/taken-all`
      );
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <EditProfileDialog
        open={isEditProfileDialogOpen}
        onOpenChange={setIsEditProfileDialogOpen}
      />
      <Card>
        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={user?.profile?.image_url}
                alt="Your avatar"
              />
              <AvatarFallback>
                {user?.first_name.slice(0, 1)}
                {user?.last_name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-2xl font-bold">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-muted-foreground">@{user.username}</p>
              <p>{user?.bio}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GlobeIcon className="w-4 h-4" />
                  {user?.location || "Earth, Milky Way"}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Joined {new Date(user?.created_at).toDateString()}
                </span>
              </div>
            </div>
            {session?.user.username === user.username && (
              <div className="absolute top-5 right-5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"}>
                      <EllipsisVertical className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-3 w-56">
                    <DropdownMenuItem
                      onClick={() => setIsEditProfileDialogOpen(true)}
                    >
                      <User2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Share Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Suspense>
        <UserStatistics challenges={takenChallenges || []} />
      </Suspense>
      <Suspense>
        <UserRecentProjects challenges={takenChallenges || []} />
      </Suspense>
    </div>
  );
};
export default UserProfile;
