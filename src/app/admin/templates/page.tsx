"use client";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (u:string)=>fetch(u).then(r=>r.json());

type Field = { key:string; label:string; type:"TEXT"|"NUMBER"|"IMAGE"|"RICHTEXT"; required:boolean };
export default function TemplatesPage(){
  const { data, mutate } = useSWR("/api/templates", fetcher);
  const [name,setName]=useState("");
  const [fields,setFields]=useState<Field[]>([
    {key:"image",label:"Image",type:"IMAGE",required:true},
    {key:"title",label:"Title",type:"TEXT",required:true},
    {key:"price",label:"Price",type:"NUMBER",required:false},
  ]);

  async function create(){
    await fetch("/api/templates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,fields})});
    setName(""); mutate();
  }

  return (
    <div className="container grid">
      <h2>Templates</h2>
      <div className="card grid" style={{maxWidth:600}}>
        <input placeholder="Template name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={create}>Create Template</button>
      </div>

      <table className="table">
        <thead><tr><th>Name</th><th>Fields</th></tr></thead>
        <tbody>
          {data?.templates?.map((t:any)=>(
            <tr key={t.id}><td>{t.name}</td><td>{t.fields.map((f:any)=>f.key).join(", ")}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
