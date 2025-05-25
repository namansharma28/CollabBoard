'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Server, Bell, Users, FileCheck } from "lucide-react";

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Data Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard encryption protocols."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Access Control",
      description: "Role-based access control with granular permissions and team management."
    },
    {
      icon: <Server className="h-6 w-6" />,
      title: "Infrastructure Security",
      description: "Hosted on secure cloud infrastructure with regular security audits and updates."
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Security Monitoring",
      description: "24/7 monitoring for suspicious activities and automated threat detection."
    },
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: "Compliance",
      description: "Adherence to industry security standards and best practices."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Authentication",
      description: "Secure authentication with optional two-factor authentication (2FA)."
    }
  ];

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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Security at TeamLane</h1>
            <p className="text-xl text-muted-foreground">
              Your security is our top priority. Learn about our comprehensive approach to protecting your data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="prose prose-gray dark:prose-invert">
            <h2>Our Security Commitment</h2>
            <p>
              At TeamLane, we understand that the security of your data is crucial. We employ multiple layers of security controls and practices to ensure your information remains protected.
            </p>

            <h2>Data Protection</h2>
            <h3>Storage Security</h3>
            <ul>
              <li>AES-256 encryption for data at rest</li>
              <li>TLS 1.3 for data in transit</li>
              <li>Regular backup procedures</li>
              <li>Secure data centers with physical security measures</li>
            </ul>

            <h3>Access Security</h3>
            <ul>
              <li>Strong password requirements</li>
              <li>Two-factor authentication support</li>
              <li>Session management and automatic timeouts</li>
              <li>IP-based access controls</li>
            </ul>

            <h2>Infrastructure Security</h2>
            <ul>
              <li>Regular security patches and updates</li>
              <li>Network segmentation and firewalls</li>
              <li>DDoS protection</li>
              <li>Intrusion detection and prevention systems</li>
            </ul>

            <h2>Compliance and Certifications</h2>
            <p>
              We maintain compliance with industry standards and regularly undergo security assessments:
            </p>
            <ul>
              <li>SOC 2 Type II certified</li>
              <li>GDPR compliant</li>
              <li>ISO 27001 certified</li>
              <li>Regular penetration testing</li>
            </ul>

            <h2>Security Reporting</h2>
            <p>
              If you discover a potential security issue, please contact our security team immediately:
            </p>
            <p>
              Email: security@teamlane.com<br />
              Emergency: +1 (555) 123-4567
            </p>

            <div className="bg-muted p-6 rounded-lg mt-8">
              <h3 className="text-xl font-semibold mb-2">Responsible Disclosure</h3>
              <p>
                We appreciate the work of security researchers and welcome responsible disclosure of security vulnerabilities. Please review our security policy before conducting any security testing.
              </p>
              {/* <Button className="mt-4" variant="outline" asChild>
                <Link href="/security/disclosure">View Disclosure Policy</Link>
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 