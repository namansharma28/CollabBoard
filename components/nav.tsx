import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function Nav() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";

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
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        {/* Your logo/brand */}
      </div>
      
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600">
              {session?.user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
} 