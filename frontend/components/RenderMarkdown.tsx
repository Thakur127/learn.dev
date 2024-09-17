import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRemoveComments from "remark-remove-comments";

const RenderMarkdown = ({ content }: { content: string }) => {
  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkRemoveComments]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default memo(RenderMarkdown);
