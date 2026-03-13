"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { initiateEmailSignUp } from "@/firebase/non-blocking-login"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { doc, collection } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Loader2, Zap } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  orgName: z.string().min(2, "Business name required"),
});

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [orgName, setOrgName] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (user && name && db && orgName) {
      const orgId = doc(collection(db, "organizations")).id;
      const userRef = doc(db, "users", user.uid);
      const orgRef = doc(db, "organizations", orgId);
      const memberRef = doc(db, "organizations", orgId, "members", user.uid);

      setDocumentNonBlocking(orgRef, {
        id: orgId,
        name: orgName,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        billing_status: 'active',
        plan: 'starter'
      }, { merge: true });

      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        name: name,
        organizationId: orgId,
        role: "org_owner",
        plan: "starter",
        suspended: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setDocumentNonBlocking(memberRef, {
        userId: user.uid,
        organizationId: orgId,
        role: "org_owner",
        joinedAt: new Date().toISOString(),
      }, { merge: true });

      router.push("/dashboard");
    }
  }, [user, name, db, orgName, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const validation = signupSchema.safeParse({ name, email, password, orgName })
    if (!validation.success) {
      const formattedErrors: { [key: string]: string } = {}
      validation.error.issues.forEach(issue => {
        formattedErrors[issue.path[0] as string] = issue.message
      })
      setErrors(formattedErrors)
      setLoading(false)
      return
    }

    try {
      await initiateEmailSignUp(auth, email, password)
    } catch (err: any) {
      setLoading(false)
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.message || "Could not create account.",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-md glass-card border-none z-10 overflow-hidden">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pb-6 pt-10">
          <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/20">
            <Zap className="w-8 h-8 text-white fill-current" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-normal tracking-tight text-metallic">Create Business Account</CardTitle>
            <CardDescription className="text-muted-foreground/80">Launch your autonomous SEO command center. <span className="text-primary">Free 5-day trial.</span></CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 h-11 rounded-xl"
                />
                {errors.name && <p className="text-[10px] text-rose-400 font-normal">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground">Business Name</Label>
                <Input 
                  id="orgName" 
                  required 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="bg-white/5 border-white/10 h-11 rounded-xl"
                />
                {errors.orgName && <p className="text-[10px] text-rose-400 font-normal">{errors.orgName}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 h-11 rounded-xl"
              />
              {errors.email && <p className="text-[10px] text-rose-400 font-normal">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground">Master Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 h-11 rounded-xl"
              />
              {errors.password && <p className="text-[10px] text-rose-400 font-normal">{errors.password}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4 pb-10">
            <Button type="submit" className="w-full h-12 font-normal text-lg premium-gradient rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Member of a team?{" "}
              <Link href="/login" className="text-primary font-normal hover:underline">Sign In</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
