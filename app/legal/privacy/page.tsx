'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-8"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="prose prose-gray dark:prose-invert max-w-4xl mx-auto">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Information We Collect</h2>
          <h3>1.1 Personal Information</h3>
          <p>
            When you use TeamLane, we collect certain information that can identify you, such as:
          </p>
          <ul>
            <li>Email address</li>
            <li>Name</li>
            <li>Profile information</li>
            <li>Usage data and preferences</li>
          </ul>

          <h3>1.2 Usage Information</h3>
          <p>
            We automatically collect information about how you use TeamLane, including:
          </p>
          <ul>
            <li>Log data (e.g., access times, pages viewed)</li>
            <li>Device information</li>
            <li>IP address</li>
            <li>Browser type and settings</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the collected information for the following purposes:
          </p>
          <ul>
            <li>Providing and maintaining TeamLane services</li>
            <li>Improving and personalizing user experience</li>
            <li>Communicating with you about updates and features</li>
            <li>Ensuring platform security and preventing abuse</li>
          </ul>

          <h2>3. Data Sharing and Disclosure</h2>
          <p>
            We do not sell your personal information. We may share your information in the following circumstances:
          </p>
          <ul>
            <li>With your team members based on your workspace settings</li>
            <li>With service providers who assist in our operations</li>
            <li>When required by law or to protect our rights</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your information, including:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Continuous monitoring for potential vulnerabilities</li>
          </ul>

          <h2>5. Your Rights and Choices</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@teamlane.com<br />
            Address: 123 Collaboration Street, Suite 100<br />
            Tech City, TC 12345
          </p>
        </div>
      </div>
    </div>
  );
} 