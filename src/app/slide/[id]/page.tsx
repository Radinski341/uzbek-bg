"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  id:string; name:string; speedMs:number; effect:"FADE"|"SLIDE"; updatedAt:string;
  items: { id:string; order:number; banner: { id:string; data:any; template:{ fields: any[] } } }[]
};

export default function SlidePlayer({ params }:{ params:{ id:string } }){
  const [slide,setSlide] = useState<Slide|null>(null);
  const [idx,setIdx] = useState(0);
  const etagRef = useRef<string>("");

  const banners = useMemo(()=> slide?.items?.map(i=>i.banner) ?? [], [slide]);

  useEffect(()=>{
    let int: any;
    async function load(initial=false){
      const res = await fetch(`/api/slides/${params.id}`, { cache:"no-store" });
      const et = res.headers.get("ETag") || "";
      const data = await res.json();
      if (initial || et !== etagRef.current) {
        etagRef.current = et;
        // Try to preserve current banner if still present
        const currentId = banners[idx]?.id;
        setSlide(data);
        if (currentId) {
          const newIndex = data.items.findIndex((it:any)=>it.banner.id===currentId);
          setIdx(newIndex >= 0 ? newIndex : 0);
        } else {
          setIdx(0);
        }
      }
    }
    load(true);
    int = setInterval(()=>load(false), 60_000); // poll every minute
    return ()=> clearInterval(int);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(()=>{
    if (!slide) return;
    const timer = setInterval(()=> setIdx(i=> (i+1) % (banners.length || 1)), Math.max(1500, slide.speedMs));
    return ()=> clearInterval(timer);
  }, [slide, banners.length]);

  if (!slide) return <div style={{padding:20}}>Loading...</div>;
  if (!banners.length) return <div style={{padding:20}}>No banners</div>;

  return (
    <div style={{position:'fixed', inset:0, background:'#000', overflow:'hidden'}}>
      {slide.effect === "SLIDE" ? <SlideTrack banners={banners} idx={idx}/> : <FadeStack banners={banners} idx={idx}/>}
      <div style={{position:'fixed', right:12, bottom:8, fontSize:12, color:'#aaa'}}>
        {slide.name} • {idx+1}/{banners.length} • F=fullscreen
      </div>
      <FullscreenHotkey />
    </div>
  );
}

function FullscreenHotkey(){
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if (e.key.toLowerCase()==='f'){
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
        else document.exitFullscreen().catch(()=>{});
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);
  return null;
}

function getField(data:any, key:string){ return data?.[key]; }

// Basic render for the “Dish of the Day” template; generic fallback renders image/title/info/price if present.
function BannerView({ banner }:{ banner:any }){
  const d = banner.data || {};
  const img = getField(d,'image');
  const title = getField(d,'title');
  const info = getField(d,'info');
  const price = getField(d,'price');

  return (
    <div style={{position:'absolute', inset:0}}>
      {img && <img src={img} alt={title||'banner'} style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'}} />}
      <div style={{position:'absolute', left:'5%', bottom:'8%', background:'rgba(0,0,0,0.45)', padding:'16px 20px', borderRadius:12}}>
        {title && <div style={{fontSize:'3vw', fontWeight:700}}>{title}</div>}
        {info && <div style={{fontSize:'1.4vw', marginTop:6, maxWidth:'60vw'}} dangerouslySetInnerHTML={{__html:info}} />}
        {price!=null && <div style={{fontSize:'2.2vw', fontWeight:700, marginTop:6}}>{Number(price).toFixed(2)} лв</div>}
      </div>
    </div>
  );
}

function FadeStack({ banners, idx }:{ banners:any[]; idx:number }){
  return (
    <div style={{position:'absolute', inset:0}}>
      {banners.map((b, i)=>(
        <div key={b.id} style={{
          position:'absolute', inset:0, opacity: i===idx?1:0, transition:'opacity 700ms ease-in-out'
        }}>
          <BannerView banner={b} />
        </div>
      ))}
    </div>
  );
}

function SlideTrack({ banners, idx }:{ banners:any[]; idx:number }){
  return (
    <div style={{position:'absolute', inset:0, display:'flex', width:`${banners.length*100}vw`, height:'100%', transform:`translateX(-${idx*100}vw)`, transition:'transform 700ms ease-in-out' }}>
      {banners.map((b)=>(
        <div key={b.id} style={{minWidth:'100vw', height:'100vh', position:'relative'}}>
          <BannerView banner={b} />
        </div>
      ))}
    </div>
  );
}
