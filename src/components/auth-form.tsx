import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useState } from "react"

export default function AuthForm() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [isSignUp,setIsSignUp] = useState(false);
  const [loading,setLoading] = useState(false);
  const [errorMsg,setErrorMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if(isSignUp) {
      const {error} = await supabase.auth.signUp({email,password});
      if(error) setErrorMsg(error.message);
      else alert("Check your email for the confirmation link!");
    }else {
      const {error} = await supabase.auth.signInWithPassword({email,password});
      if (error) setErrorMsg(error.message);
    }
    setLoading(false);
  }


  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-2 border-border shadow-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            {errorMsg && <p className="text-xs font-bold text-destructive">{errorMsg}</p>}
            
            <Button type="submit" className="w-full hover:cursor-pointer" disabled={loading}>
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>

            <div className="text-center mt-4">
              <button 
                type="button" 
                className="text-xs text-muted-foreground hover:underline cursor-pointer"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
