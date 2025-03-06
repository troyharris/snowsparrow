import { Card, CardContent, CardHeader } from "@/components/shared";
import Link from "next/link";
import { AdminTool } from "@/lib/types";

const adminTools: AdminTool[] = [
  {
    name: "Models",
    description: "Manage AI models used by the application",
    href: "/admin/models",
    icon: "model_training",
  },
  {
    name: "Prompts",
    description: "Manage system prompts for AI tools",
    href: "/admin/prompts",
    icon: "description",
  },
  {
    name: "Prompt Injects",
    description: "Manage reusable prompt components",
    href: "/admin/prompt-injects",
    icon: "integration_instructions",
  },
  {
    name: "Users",
    description: "Manage user accounts and permissions",
    href: "/admin/users",
    icon: "people",
  },
];

export default function AdminDashboard() {
  return (
    <div className="container mx-auto">
      {/* Add Google Material Icons */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool) => (
          <Link href={tool.href} key={tool.href} className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader title={tool.name} />
              <CardContent>
                <div className="flex items-start space-x-4">
                  <span 
                    className="material-icons text-2xl opacity-80"
                    aria-hidden="true"
                  >
                    {tool.icon}
                  </span>
                  <p className="text-gray-600">{tool.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
