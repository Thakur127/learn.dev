import { DifficultyTag as ChallengeDifficultyTag } from "@/types/challenges";
import { Badge } from "./ui/badge";

const DifficultyTag: React.FC<{
  level: ChallengeDifficultyTag;
  children: React.ReactNode;
}> = ({ level, children }) => {
  // set color according to level
  return (
    <Badge
      className={`${
        level === ChallengeDifficultyTag.BEGINNER
          ? "bg-green-200 text-green-600 hover:bg-green-300/80"
          : level === ChallengeDifficultyTag.INTERMEDIATE
          ? "bg-yellow-200 text-yellow-600 hover:bg-yellow-300/80"
          : level === ChallengeDifficultyTag.ADVANCE ? "bg-orange-200 text-orange-600 hover:bg-orange-300/80" :
          level === ChallengeDifficultyTag.EXPERT && "bg-red-200 text-red-600 hover:bg-red-300/80"
      } capitalize`}
    >
      {children}
    </Badge>
  );
};

export default DifficultyTag;
