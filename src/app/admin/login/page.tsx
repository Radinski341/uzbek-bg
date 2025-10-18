"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [err,setErr]=useState(""); const router=useRouter();

  async function submit(e:any){e.preventDefault();
    const res = await signIn("credentials",{redirect:false,email,password});
    if(res?.ok){ router.push("/admin"); } else { setErr("Invalid credentials"); }
  }

  return (
    <div className="container">
      <h2>Admin Login</h2>
      <form onSubmit={submit} className="grid" style={{maxWidth:340}}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Sign in</button>
        {err && <div style={{color:"#f87171"}}>{err}</div>}
      </form>
    </div>
  );
}
