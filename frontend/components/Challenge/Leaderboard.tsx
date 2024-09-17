import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

export default function Leaderboard() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Developers who excelled in this challenge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {rank === 1 && <Trophy className="h-6 w-6 text-yellow-500" />}
                  {rank === 2 && <Trophy className="h-6 w-6 text-gray-400" />}
                  {rank === 3 && <Trophy className="h-6 w-6 text-amber-600" />}
                </div>
                <Avatar>
                  <AvatarImage
                    src={`https://i.pravatar.cc/150?img=${rank}`}
                    alt={`Top ${rank} developer`}
                  />
                  <AvatarFallback>TD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Top Developer {rank}</p>
                  <p className="text-sm text-muted-foreground">
                    Score: {100 - (rank - 1) * 5}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Performance</CardTitle>
          <CardDescription>How you stack up against others</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage
                src="https://i.pravatar.cc/150?img=5"
                alt="Your avatar"
              />
              <AvatarFallback>YA</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Your Rank: 42nd</p>
              <p className="text-sm text-muted-foreground">Score: 75</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg">Improve Your Ranking</Button>
      </div>
    </>
  );
}
