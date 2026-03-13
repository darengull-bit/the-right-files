"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUser } from "@/firebase"
import { initiateEmailSignIn } from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Zap } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isUserLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    loading ? null : setLoading(true)
    try {
      await initiateEmailSignIn(auth, email, password)
    } catch (err: any) {
      setLoading(false)
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Invalid credentials. Please try again.",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md glass-card border-none z-10 overflow-hidden shadow-2xl">
        <CardHeader className="space-y-6 flex flex-col items-center text-center pb-8 pt-12">
          
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/20">
              <Zap className="w-8 h-8 text-white fill-current" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" /> Powered by Genkit AI
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-black tracking-tight text-metallic">Command Center</CardTitle>
            <CardDescription className="text-muted-foreground/80 font-medium">Authorize to manage your search dominance</CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="user@business.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 h-12 focus:ring-2 focus:ring-primary/50 transition-all rounded-xl font-medium"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Password</Label>
                <Link href="#" className="text-[10px] text-primary hover:text-primary/80 transition-colors font-black uppercase tracking-widest">Recovery</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 h-12 focus:ring-2 focus:ring-primary/50 transition-all rounded-xl font-medium"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 pt-4 pb-10">
            <Button type="submit" className="w-full h-14 font-black text-lg premium-gradient shadow-xl shadow-primary/20 rounded-xl uppercase tracking-widest" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Access Dashboard"}
            </Button>
            <p className="text-sm text-center text-muted-foreground font-medium">
              New to the platform?{" "}
              <Link href="/signup" className="text-primary font-black hover:underline">Create Account</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-8 text-[10px] text-muted-foreground/40 uppercase tracking-[0.4em] font-black">
        Enterprise-Grade Business SEO Intelligence
      </p>
    </div>
  )
}