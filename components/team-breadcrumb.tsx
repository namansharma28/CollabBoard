"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface TeamInfo {
  _id: string;
  name: string;
}

export function TeamBreadcrumb() {
  const params = useParams() || {};
  const pathname = usePathname();
  const teamId = params.teamId as string;
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get current section from pathname
  const getCurrentSection = () => {
    if (!teamId) return "";
    
    const path = pathname?.replace(`/${teamId}/`, "");
    // Handle nested paths
    const section = path?.split("/")[0];
    
    // Capitalize first letter and format
    if (!section) return "";
    return section.charAt(0).toUpperCase() + section.slice(1);
  };
  
  useEffect(() => {
    const fetchTeamInfo = async () => {
      if (!teamId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/teams/${teamId}`);
        if (response.ok) {
          const data = await response.json();
          setTeamInfo(data);
        }
      } catch (error) {
        console.error("Error fetching team info:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamInfo();
  }, [teamId]);
  
  if (!teamId) return null;
  
  const currentSection = getCurrentSection();
  
  return (
    <div className="px-4 py-2 bg-background border-b">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/team-selection">
                <Home className="h-4 w-4" />
                <span className="sr-only">Teams</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${teamId}/dashboard`}>
                {isLoading ? "Loading..." : teamInfo?.name || `Team ${teamId.substring(0, 6)}...`}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {currentSection && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentSection}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
} 