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
import { ArrowRight, CheckCircle, Star, Zap, Users, Shield, Sparkles } from "lucide-react";

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
      initials: "SJ",
      rating: 5
    },
    {
      quote: "The team chat functionality is seamless and integrates perfectly with our Kanban boards. It's become essential to our daily workflow.",
      name: "Michael Rodriguez",
      role: "Technical Lead, TechCorp",
      initials: "MR",
      rating: 5
    },
    {
      quote: "We've tried many collaboration tools, but TeamLane stands out with its intuitive interface and comprehensive feature set. Highly recommended!",
      name: "Emily Chen",
      role: "Marketing Director, GrowthLabs",
      initials: "EC",
      rating: 5
    },
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
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-indigo-300/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <header className={`border-b sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'shadow-lg border-purple-200/50 dark:border-purple-800/50' : 'border-transparent'} px-2 md:px-4 lg:px-6`}>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2 pl-2 md:pl-4 lg:pl-3">
            <Link href="/home" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <ImageWithFallback 
                    src="/teamlane.svg" 
                    fallbackSrc="/teamlane.png" 
                    alt="TeamLane Logo" 
                    className="h-5 w-auto"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity"></div>
              </div>
              <div className="font-bold text-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                TeamLane
              </div>
            </Link>
          </div>
          <nav className={`hidden md:flex items-center space-x-6 text-sm font-medium`}>
            <Link href="/#features" className="transition-colors hover:text-purple-600 hover:underline underline-offset-4 decoration-purple-400">
              Features
            </Link>
            <Link href="/#testimonials" className="transition-colors hover:text-purple-600 hover:underline underline-offset-4 decoration-purple-400">
              Testimonials
            </Link>
            <Link href="/#pricing" className="transition-colors hover:text-purple-600 hover:underline underline-offset-4 decoration-purple-400">
              Get Started
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground px-3 py-1 bg-purple-50 dark:bg-purple-950/50 rounded-full border border-purple-200 dark:border-purple-800">
                  {session?.user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="transition-colors hover:text-purple-600 hover:underline underline-offset-4 decoration-purple-400">
                  Login
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform"
            >
              {isAuthenticated ? 'Go to Teams' : 'Get Started'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative hover:bg-purple-50 dark:hover:bg-purple-950/50"
              >
                <div className={`w-6 h-0.5 bg-current absolute transition-all duration-300 ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></div>
                <div className={`w-6 h-0.5 bg-current absolute transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
                <div className={`w-6 h-0.5 bg-current absolute transition-all duration-300 ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></div>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 border-b border-purple-200/50 dark:border-purple-800/50' : 'max-h-0'}`}>
          <div className="container py-4 space-y-4 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-950/50 dark:to-indigo-950/50">
            <Link href="#features" className="block px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md transition-colors">
              Features
            </Link>
            <Link href="/#testimonials" className="block px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md transition-colors">
              Testimonials
            </Link>
            <Link href="/#pricing" className="block px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md transition-colors">
              Get Started
            </Link>
            {isAuthenticated ? (
              <>
                <div className="border-t border-purple-200 dark:border-purple-800 pt-2 mt-2 flex flex-col space-y-2">
                  <span className="text-sm text-muted-foreground px-2">
                    {session?.user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md hover:from-red-600 hover:to-red-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="block px-2 py-1 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="py-20 md:py-28 lg:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_800px]">
              <div className="flex flex-col justify-center space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-full border border-purple-200 dark:border-purple-800">
                    <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      The future of team collaboration
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-6xl xl:text-7xl">
                    <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                      Collaborate
                    </span>
                    <br />
                    <span className="text-foreground">with your team,</span>
                    <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      all in one space
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-xl text-muted-foreground leading-relaxed">
                    Manage tasks, take notes, and communicate with your team in real-time.
                    Boost productivity and streamline your workflow with our powerful collaboration platform.
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button 
                    size="lg" 
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform text-lg px-8 py-6"
                  >
                    {isAuthenticated ? 'Go to Teams' : 'Start Free Trial'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" asChild className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50 text-lg px-8 py-6">
                    <Link href="/#features">
                      <Zap className="mr-2 h-5 w-5" />
                      Explore Features
                    </Link>
                  </Button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center gap-6 pt-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 border-2 border-white dark:border-slate-950 flex items-center justify-center text-white text-xs font-semibold">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">Join all these teams teams</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">4.9/5 rating</span>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mx-auto w-full max-w-[800px] lg:mx-0"
              >
                <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 overflow-hidden border border-purple-200/50 dark:border-purple-800/50 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-indigo-600/20 animate-pulse"></div>
                  <Image
                    alt="TeamLane Dashboard"
                    src="/animat.gif"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    fill
                    priority
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live collaboration in action</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 md:py-24 relative overflow-hidden bg-gradient-to-b from-transparent to-purple-50/30 dark:to-purple-950/30">
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Zap className="inline h-4 w-4 mr-2" />
                Powerful Features
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Everything you need to collaborate
              </h2>
              <p className="max-w-[900px] text-xl text-muted-foreground">
                TeamLane provides all the tools your team needs to work efficiently together
              </p>
            </motion.div>
            
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex flex-col items-center space-y-4 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-center">{feature.title}</h3>
                    <p className="text-muted-foreground text-center leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        {/* <section id="testimonials" className="py-20 md:py-24 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-purple-50/50 dark:from-purple-950/50 dark:via-indigo-950/30 dark:to-purple-950/50 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Users className="inline h-4 w-4 mr-2" />
                Loved by Teams
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                What our users say
              </h2>
              <p className="max-w-[900px] text-xl text-muted-foreground">
                Discover how TeamLane transforms team collaboration
              </p>
            </motion.div>
            
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex flex-col justify-between rounded-2xl border border-purple-200/50 dark:border-purple-800/50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                    <div className="space-y-4">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <blockquote className="text-lg leading-relaxed">
                        "{testimonial.quote}"
                      </blockquote>
                    </div>
                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-purple-200/50 dark:border-purple-800/50">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                        {testimonial.initials}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}
        
        {/* CTA Section */}
        <section id="pricing" className="py-20 md:py-24 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="inline-block rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Shield className="inline h-4 w-4 mr-2" />
                Ready to Start?
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Start collaborating today
              </h2>
              <p className="max-w-[900px] text-xl text-muted-foreground">
                Join thousands of teams already using TeamLane to boost their productivity
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl"
            >
              <div className="relative rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-12 text-center text-white shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-indigo-600/20 animate-pulse"></div>
                <div className="relative space-y-6">
                  <h3 className="text-3xl font-bold">Ready to transform your team&apos;s workflow?</h3>
                  <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                    Get started with TeamLane today and experience the future of team collaboration.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Button 
                      size="lg" 
                      onClick={handleGetStarted}
                      className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform text-lg px-8 py-6 font-semibold"
                    >
                      {isAuthenticated ? 'Go to Teams' : 'Start Free Trial'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2 text-purple-100">
                      <CheckCircle className="h-5 w-5" />
                      <span>No credit card required</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        <footer className="border-t border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-purple-50/30 to-indigo-50/30 dark:from-purple-950/30 dark:to-indigo-950/30">
          <div className="container px-4 py-16 md:py-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div className="space-y-4">
                <Link href="/" className="flex items-center space-x-2">
                  <ImageWithFallback 
                    src="/teamlane.svg" 
                    fallbackSrc="/teamlane.png" 
                    alt="TeamLane Logo" 
                    className="h-8 w-auto" 
                  />
                  <div className="font-bold text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">TeamLane</div>
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Empowering teams to work better together through seamless collaboration and organization.
                </p>
                <div className="flex items-center space-x-4">
                  <Link href="https://twitter.com" className="text-muted-foreground hover:text-purple-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </Link>
                  <Link href="https://github.com" className="text-muted-foreground hover:text-purple-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link href="https://linkedin.com" className="text-muted-foreground hover:text-purple-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/#features" className="hover:text-purple-600 transition-colors">Features</Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-purple-600 transition-colors">Get Started</Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-purple-600 transition-colors">Sign In</Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/legal/privacy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link href="/legal/terms" className="hover:text-purple-600 transition-colors">Terms of Service</Link>
                  </li>
                  <li>
                    <Link href="/legal/security" className="hover:text-purple-600 transition-colors">Security</Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">Connect</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="mailto:hello@teamlane.com" className="hover:text-purple-600 transition-colors">Contact Us</Link>
                  </li>
                  <li>
                    <Link href="/legal/security" className="hover:text-purple-600 transition-colors">Support</Link>
                  </li>
                  <li>
                    <Link href="/#testimonials" className="hover:text-purple-600 transition-colors">Community</Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-purple-200/50 dark:border-purple-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} TeamLane. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Made with ❤️ for teams everywhere</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}