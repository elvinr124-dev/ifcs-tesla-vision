import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Trash2, User, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!user.email) return;
    setDeleting(true);
    try {
      const { error } = await (supabase as any)
        .from("client_accounts")
        .delete()
        .eq("email", user.email);

      if (error) throw error;

      logout();
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      navigate("/");
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.username?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {/* Profile card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-lg">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl font-bold text-accent-foreground">{initials}</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username}
              </h1>
              {user.email && (
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              )}
              <span className="mt-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold capitalize">
                {user.role}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl bg-muted hover:bg-muted/80 transition-all duration-200 group"
              >
                <LogOut size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-semibold text-foreground">Sign Out</span>
              </button>

              {user.role === "client" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl bg-destructive/10 hover:bg-destructive/20 transition-all duration-200 group"
                    >
                      <Trash2 size={20} className="text-destructive" />
                      <span className="text-sm font-semibold text-destructive">Delete Account</span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </main>
      <BackToHome />
      <Footer />
    </div>
  );
};

export default Account;
