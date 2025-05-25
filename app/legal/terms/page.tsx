'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using TeamLane, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing TeamLane.
          </p>

          <h2>2. Use License</h2>
          <h3>2.1 Permitted Use</h3>
          <p>
            TeamLane grants you a limited, non-exclusive, non-transferable license to use the platform for your internal business purposes, subject to these terms.
          </p>

          <h3>2.2 Restrictions</h3>
          <p>
            You may not:
          </p>
          <ul>
            <li>Modify or copy the materials outside of normal platform usage</li>
            <li>Use the materials for any commercial purpose not authorized by TeamLane</li>
            <li>Attempt to decompile or reverse engineer any software contained in TeamLane</li>
            <li>Remove any copyright or other proprietary notations</li>
            <li>Transfer the materials to another person or organization</li>
          </ul>

          <h2>3. User Accounts</h2>
          <h3>3.1 Account Creation</h3>
          <p>
            To use TeamLane, you must:
          </p>
          <ul>
            <li>Create an account with accurate, complete information</li>
            <li>Maintain and update your account information</li>
            <li>Keep your account credentials secure</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>

          <h3>3.2 Account Termination</h3>
          <p>
            TeamLane reserves the right to terminate or suspend accounts, without prior notice or liability, for any reason, including violation of these Terms.
          </p>

          <h2>4. Service Availability and Updates</h2>
          <p>
            We strive to provide uninterrupted service but may occasionally:
          </p>
          <ul>
            <li>Perform necessary maintenance</li>
            <li>Release new features and updates</li>
            <li>Modify or discontinue features</li>
            <li>Address technical issues</li>
          </ul>

          <h2>5. Data and Content</h2>
          <h3>5.1 Your Content</h3>
          <p>
            You retain all rights to your content. By using TeamLane, you grant us a license to host, store, and share your content according to your settings.
          </p>

          <h3>5.2 Acceptable Use</h3>
          <p>
            You agree not to use TeamLane to:
          </p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful code or content</li>
            <li>Harass or discriminate against others</li>
          </ul>

          <h2>6. Liability and Warranty</h2>
          <p>
            TeamLane is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from the use of our service.
          </p>

          <h2>7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of significant changes and continue to use TeamLane constitutes acceptance of modified terms.
          </p>

          <h2>8. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
          </p>
          <p>
            Email: legal@teamlane.com<br />
            Address: 123 Collaboration Street, Suite 100<br />
            Tech City, TC 12345
          </p>
        </div>
      </div>
    </div>
  );
} 