'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import Image from "next/image";



export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Features data for the features grid
  const features = [
    {
      title: "Kanban Boards",
      description: "Visualize your workflow and move tasks through different stages effortlessly",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M7 7h10" />
          <path d="M7 12h10" />
          <path d="M7 17h10" />
        </svg>
      ),
    },
    {
      title: "Shared Notes",
      description: "Create and edit notes together in real-time with your entire team",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
        </svg>
      ),
    },
    {
      title: "Team Chat",
      description: "Communicate instantly with direct messages and group chats",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
          <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
        </svg>
      ),
    },
    {
      title: "Team Management",
      description: "Create teams, manage members, and assign roles with flexible permissions",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      title: "Dashboard & Analytics",
      description: "Get insights into team performance with visual analytics and activity feeds",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      ),
    },
    {
      title: "Real-time Sync",
      description: "All changes sync instantly so your team always sees the latest updates",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M8.4 10.6a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2z" />
          <path d="M18.09 10.37A1.94 1.94 0 1 0 16 8.56a1.94 1.94 0 0 0 2.09 1.81z" />
          <path d="M10.89 15.94A1.94 1.94 0 1 0 9 14.25a1.94 1.94 0 0 0 1.89 1.69z" />
          <path d="M17.95 15.97a1.94 1.94 0 1 0-2.2-1.7 1.94 1.94 0 0 0 2.2 1.7z" />
          <path d="m14.08 8-1.65 1.9" />
          <path d="m10.64 12.19-1.05 1.22" />
          <path d="m15.81 12.75-2.91.42" />
        </svg>
      ),
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "TeamLane has transformed how our team collaborates. The Kanban board is intuitive and the real-time notes feature saves us so much time.",
      name: "Sarah Johnson",
      role: "Product Manager, Acme Inc",
      initials: "SJ"
    },
    {
      quote: "The team chat functionality is seamless and integrates perfectly with our Kanban boards. It's become essential to our daily workflow.",
      name: "Michael Rodriguez",
      role: "Technical Lead, TechCorp",
      initials: "MR"
    },
    {
      quote: "We've tried many collaboration tools, but TeamLane stands out with its intuitive interface and comprehensive feature set. Highly recommended!",
      name: "Emily Chen",
      role: "Marketing Director, GrowthLabs",
      initials: "EC"
    },
  ];

  // Pricing plans data
  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for small teams just getting started",
      price: 10,
      features: [
        "Up to 5 team members",
        "10 boards",
        "Basic team chat",
        "Shared notes"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      description: "For growing teams that need more power",
      price: 25,
      features: [
        "Up to 20 team members",
        "Unlimited boards",
        "Advanced team chat",
        "Shared notes with rich formatting",
        "Analytics dashboard"
      ],
      buttonText: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For organizations that need additional security",
      price: 50,
      features: [
        "Unlimited team members",
        "Unlimited boards and workspaces",
        "Enterprise-grade security",
        "Advanced analytics and reporting",
        "Dedicated support"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  // Track scroll position for header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("token");
      
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      // Sign out from NextAuth
      await signOut({ 
        redirect: false 
      });
      
      toast.success("Logged out successfully!");
      router.push("/home");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/team-selection');
    } else {
      router.push('/register');
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <header className={`border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-md' : ''} px-2 md:px-4 lg:px-6`}>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2 pl-2 md:pl-4 lg:pl-3">
            <Link href="/home" className="flex items-center space-x-2">
              <ImageWithFallback 
                src="/teamlane.svg" 
                fallbackSrc="/teamlane.png" 
                alt="TeamLane Logo" 
                className="h-8 w-auto" 
              />
               <div className="font-bold text-xl bg-gradient-to-r from-primary to-blue-200 bg-clip-text text-transparent ">TeamLane</div>
            </Link>
          </div>
          <nav className={`hidden md:flex items-center space-x-6 text-sm font-medium`}>
            <Link href="/#features" className="transition-colors hover:text-foreground/80 hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="/#testimonials" className="transition-colors hover:text-foreground/80 hover:underline underline-offset-4">
              Testimonials
            </Link>
            <Link href="/#pricing" className="transition-colors hover:text-foreground/80 hover:underline underline-offset-4">
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {session?.user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="transition-colors hover:text-foreground/80 hover:underline underline-offset-4">
                  Login
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              {isAuthenticated ? 'Go to Teams' : 'Get Started'}
            </Button>
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative"
              >
                <div className={`w-6 h-0.5 bg-current absolute transition-all duration-300 ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></div>
                <div className={`w-6 h-0.5 bg-current absolute transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
                <div className={`w-6 h-0.5 bg-current absolute transition-all duration-300 ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></div>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 border-b' : 'max-h-0'}`}>
          <div className="container py-4 space-y-4">
            <Link href="/#features" className="block px-2 py-1 hover:bg-muted rounded-md transition-colors">
              Features
            </Link>
            <Link href="/#testimonials" className="block px-2 py-1 hover:bg-muted rounded-md transition-colors">
              Testimonials
            </Link>
            <Link href="/#pricing" className="block px-2 py-1 hover:bg-muted rounded-md transition-colors">
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <div className="border-t pt-2 mt-2 flex flex-col space-y-2">
                  <span className="text-sm text-muted-foreground px-2">
                    {session?.user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="block px-2 py-1 hover:bg-muted rounded-md transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-background via-background/95 to-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_800px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Collaborate with your team, all in one space
                  </h1>
                  </div>
                  <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Manage tasks, take notes, and communicate with your team in real-time.
                    Boost productivity and streamline your workflow.
                  </p>
                </div>
                </div>
                <div className="space-x-4">
                  <Button 
                    size="lg" 
                    onClick={handleGetStarted}
                  >
                    {isAuthenticated ? 'Go to Teams' : 'Get Started'}
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[800px] lg:mx-0 animate-fade-in opacity-0" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
                <div className="aspect-video rounded-xl bg-foreground/5 overflow-hidden border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  <Image
                    alt="TeamLane Dashboard"
                    src="/animat.gif"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    fill
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary animate-pulse">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Everything you need to collaborate
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  TeamLane provides all the tools your team needs to work efficiently together
                </p>
              </div>
            </div>
            
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="flex flex-col items-center space-y-4 rounded-xl border p-6 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <section id="testimonials" className="py-16 md:py-20 bg-muted/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Why TeamLane?
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Built for Modern Teams
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover how TeamLane transforms team collaboration
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="flex flex-col justify-between rounded-xl border bg-background/80 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                  </div>
                  <h3 className="text-xl font-bold">Organized Workflow</h3>
                  <p className="text-muted-foreground">
                    Keep your projects structured with intuitive boards and task management. Never lose track of what needs to be done.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex flex-col justify-between rounded-xl border bg-background/80 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Real-time Updates</h3>
                  <p className="text-muted-foreground">
                    Experience seamless collaboration with instant updates. Changes sync automatically across all team members.
                  </p>
              </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex flex-col justify-between rounded-xl border bg-background/80 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M20 7h-9" />
                      <path d="M14 17H5" />
                      <circle cx="17" cy="17" r="3" />
                      <circle cx="7" cy="7" r="3" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Flexible Integration</h3>
                  <p className="text-muted-foreground">
                    Seamlessly integrate with your existing tools and workflows. Customize TeamLane to fit your team&apos;s needs.
                  </p>
                  </div>
                </motion.div>
            </div>
          </div>
        </section>
        
        <section id="pricing" className="py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Getting Started
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Start Collaborating Today
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Begin your journey with TeamLane in three simple steps
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-10">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                  viewport={{ once: true, margin: "-50px" }}
                className="flex flex-col rounded-xl border bg-background/80 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 text-4xl font-bold text-primary">1</div>
                <h3 className="text-xl font-bold mb-2">Create Your Account</h3>
                <p className="text-muted-foreground mb-4">
                  Sign up for free and set up your team workspace in minutes
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/register">Create Account</Link>
                </Button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex flex-col rounded-xl border bg-background/80 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 text-4xl font-bold text-primary">2</div>
                <h3 className="text-xl font-bold mb-2">Invite Your Team</h3>
                <p className="text-muted-foreground mb-4">
                  Add team members and assign roles to start collaborating
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex flex-col rounded-xl border bg-background/80 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 text-4xl font-bold text-primary">3</div>
                <h3 className="text-xl font-bold mb-2">Start Working</h3>
                <p className="text-muted-foreground mb-4">
                  Create boards, assign tasks, and collaborate in real-time
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/register">Get Started</Link>
                    </Button>
                </motion.div>
            </div>
          </div>
        </section>
        
        <footer className="border-t bg-muted/50">
          <div className="container px-4 py-12 md:py-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div className="space-y-4">
                <Link href="/" className="flex items-center space-x-2">
                  <ImageWithFallback 
                    src="/teamlane.svg" 
                    fallbackSrc="/teamlane.png" 
                    alt="TeamLane Logo" 
                    className="h-8 w-auto" 
                  />
                  <div className="font-bold text-xl">TeamLane</div>
                </Link>
                <p className="text-sm text-muted-foreground">
                  Empowering teams to work better together through seamless collaboration and organization.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-foreground transition-colors">Get Started</Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
                  </li>
                </ul>
              </div>

              {/* <div className="space-y-4">
                <h4 className="font-semibold">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
                  </li>
                  <li>
                    <Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                  </li>
                </ul>
              </div> */}

              <div className="space-y-4">
                <h4 className="font-semibold">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                  </li>
                  <li>
                    <Link href="/legal/security" className="hover:text-foreground transition-colors">Security</Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} TeamLane. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}