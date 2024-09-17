import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Submission() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Submission Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Implement your solution.</li>
            <li>Test your code thoroughly.</li>
            <li>
              Push your code to a <strong>GitHub</strong> repository.
            </li>
            <li>
              Create a <strong>video presentation</strong> demonstrating your
              solution and all required features.
            </li>
            <li>Any extra features you include will be appreciated.</li>
            <li>Upload your video presentation to YouTube.</li>
            <li>
              After taking the challenge, click the{" "}
              <strong>&quot;Submission pending&quot;</strong> button at the top
              right corner.
            </li>
            <li>
              A dialog will appear; fill out the required fields and submit your
              solution.
            </li>
            <li>Wait for review and feedback.</li>
            <li>
              If your submission is rejected, you will receive feedback and can
              resubmit your solution.
            </li>
            <li>
              Submissions can have four states: <strong>Pending</strong>,{" "}
              <strong>Submitted</strong>, <strong>Accepted</strong>, and{" "}
              <strong>Rejected</strong>. Once your solution is in the Submitted
              or Accepted state, no further changes can be made.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li>Code quality and organization.</li>
            <li>
              Functionality and correctness (based on the video presentation or
              a provided hosted URL).
            </li>
            <li>Performance and efficiency.</li>
            <li>Adherence to best practices.</li>
            <li>Documentation and comments.</li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
