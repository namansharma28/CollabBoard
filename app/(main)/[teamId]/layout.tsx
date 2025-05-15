"use client";

import { useParams } from "next/navigation";
import { TeamBreadcrumb } from "@/components/team-breadcrumb";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const teamId = params?.teamId as string;
  
  return (
    <div className="flex flex-col">
      <TeamBreadcrumb />
      <div className="py-1">
        {children}
      </div>
    </div>
  );
} 