import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/shared/Card";

// Tool data array for easy addition of new tools
const tools = [
  {
    name: "Flowchart Creator",
    description:
      "Transform text descriptions into professional flowcharts instantly. Perfect for documenting processes and procedures.",
    icon: "account_tree",
    href: "/mermaid",
  },
  {
    name: "Employee Handbook Chat",
    description:
      "Chat with an AI assistant about employee handbook questions and get instant answers.",
    icon: "menu_book",
    href: "/handbook",
  },
  {
    name: "AI Chat",
    description:
      "Chat with AI models using different prompts. Select a model and prompt to customize your experience.",
    icon: "chat",
    href: "/chat",
  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Add Google Material Icons */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      
      {/* Tools Grid Section */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">
          Available Tools
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.href} className="block group">
              <Card className="h-full transition-transform hover:scale-[1.02]">
                <CardHeader title={tool.name} description={tool.description} />
                <CardContent className="mt-4">
                  <div className="flex justify-center">
                    <span 
                      className="material-icons text-5xl opacity-80 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    >
                      {tool.icon}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Disclaimer Section */}
      <div className="bg-input py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader
              title="Important AI Usage Guidelines"
              description="Please review these important guidelines for using AI tools in our district."
            />
            <CardContent>
              <div className="space-y-4 text-muted">
                <p>
                  • Do not share sensitive data or personally identifiable
                  information about students or staff.
                </p>
                <p>
                  • Be aware that AI can sometimes hallucinate or make up
                  information. Always verify important information.
                </p>
                <p>
                  • Follow district guidelines for appropriate AI use in
                  education.
                </p>
                <p className="pt-4">
                  <Link
                    href="https://www.fusd1.org/site/handlers/filedownload.ashx?moduleinstanceid=2513&dataid=52908&FileName=FUSD_AI_Guidance.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    View District AI Guidance Document →
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
