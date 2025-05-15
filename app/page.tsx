'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
      quote: "TeamSpace has transformed how our team collaborates. The Kanban board is intuitive and the real-time notes feature saves us so much time.",
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
      quote: "We've tried many collaboration tools, but TeamSpace stands out with its intuitive interface and comprehensive feature set. Highly recommended!",
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
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <header className={`border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-pulse">TeamSpace</div>
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
            <Button asChild className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105">
              <Link href="/register">Get Started</Link>
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
                <div className="flex flex-col gap-2 min-[400px]:flex-row animate-fade-in opacity-0" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
                  <Button size="lg" asChild className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                    <Link href="/register">
                      Get Started
                      <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="transition-all duration-300 hover:scale-105 hover:bg-muted">
                    <Link href="/#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[800px] lg:mx-0 animate-fade-in opacity-0" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
                <div className="aspect-video rounded-xl bg-foreground/5 overflow-hidden border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                  <img
                    alt="TeamSpace Dashboard"
                    src="https://images.pexels.com/photos/7709236/pexels-photo-7709236.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                  TeamSpace provides all the tools your team needs to work efficiently together
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
                  Testimonials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Trusted by teams everywhere
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See what our customers have to say about TeamSpace
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="flex flex-col justify-between rounded-xl border bg-background/80 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                <div className="space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-yellow-500"
                      >
                        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                      "{testimonial.quote}"
                  </p>
                </div>
                <div className="mt-6 flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-1">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-medium">
                        {testimonial.initials}
                      </div>
                  </div>
                  <div>
                      <p className="text-sm font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
                  </div>
                </motion.div>
              ))}
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
                  Pricing
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Simple, transparent pricing
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that's right for your team
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-10">
              {pricingPlans.map((plan, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className={`flex flex-col rounded-xl border bg-background/80 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'ring-1 ring-primary/30 shadow-lg' : ''}`}
                >
                <div className="space-y-2">
                    {plan.popular && (
                  <div className="inline-flex items-center rounded-full border border-primary px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-primary">
                    Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                    ${plan.price}<span className="ml-1 text-base font-normal text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
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
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                        {feature}
                  </li>
                    ))}
                </ul>
                  <div className="mt-auto pt-6">
                    <Button 
                      className={`w-full hover:scale-105 transition-all duration-300 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.buttonText}
                    </Button>
                </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-20 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center space-y-6 text-center"
            >
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Ready to transform how your team works?
                </h2>
                <p className="mx-auto max-w-[700px] text-xl/relaxed text-primary-foreground/80">
                  Join thousands of teams already using TeamSpace to collaborate more effectively
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white text-primary hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                  asChild
                >
                  <Link href="/register">
                    Get Started Free
                    <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-105" 
                  asChild
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}