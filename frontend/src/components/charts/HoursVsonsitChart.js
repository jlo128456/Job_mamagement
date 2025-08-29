import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, Label } from "recharts";

const num=v=>v==null?0:typeof v==="number"?v:parseFloat(String(v).match(/[\d.]+/)?.[0]||0);
const toDate=s=>s?new Date(s):null;
const toHrs=ms=>Math.max(0,ms/36e5);
const allowRole=r=>r==="contractor"||r==="technician";
const niceName=u=>u?.contractor||(u?.email?u.email.split("@")[0]:`User ${u?.id||""}`);

const aggregate=({jobs=[],users=[],metrics=[]})=>{
  const uMap=new Map(users.map(u=>[u.id,u])); const rows=new Map(); const now=new Date();
  const bump=(uid,lh,oh)=>{ const u=uMap.get(uid); if(!uid||(u?.role&&!allowRole(u.role)))return;
    const r=rows.get(uid)||{name:niceName(u),labourHours:0,onsiteHours:0};
    r.labourHours+=num(lh); r.onsiteHours+=num(oh); rows.set(uid,r); };
  if(metrics?.length){ metrics.forEach(m=>{ if(allowRole(m.role)) bump(m.user_id,m.labour_hours,m.onsite_hours); }); }
  else{
    const span=j=>{ const s=toDate(j.onsite_time),e=toDate(j.completion_date)||toDate(j.status_timestamp)||now; return s?toHrs(e-s):0; };
    jobs.forEach(j=>{ if(j.assigned_contractor) bump(j.assigned_contractor,j.labour_hours??j.labour_time,span(j));
                      if(j.assigned_tech)       bump(j.assigned_tech,0,span(j)); });
  }
  return [...rows.values()].filter(d=>d.labourHours||d.onsiteHours)
    .sort((a,b)=>(b.labourHours+b.onsiteHours)-(a.labourHours+a.onsiteHours));
};

const fmt=v=>`${Number(v||0).toFixed(1)}h`;

export default function HoursVsOnsiteChart({ jobs, users, metrics=[] }) {
  const data=useMemo(()=>aggregate({jobs,users,metrics}),[jobs,users,metrics]);
  const base=Math.max(1,Math.ceil(Math.max(0,...data.flatMap(d=>[d.labourHours,d.onsiteHours]))));
  const desired=base+5; const steps=5; const step=Math.max(1,Math.ceil(desired/steps));
  const top=step*steps; const ticks=Array.from({length:steps+1},(_,i)=>i*step);

  return (
    <div style={{marginTop:16,padding:"16px 12px 12px",borderRadius:12,background:"#fff",boxShadow:"0 6px 18px rgba(0,0,0,.08)"}}>
      <h3 style={{margin:"0 0 10px",padding:"10px 12px 6px",lineHeight:1.25}}>Contractor / Technician: Labour Hours vs Onsite Time</h3>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} barGap={6} barCategoryGap={24} margin={{top:28,right:16,left:56,bottom:18}}>
          <CartesianGrid strokeDasharray="4 4" opacity={0.4}/>
          <XAxis dataKey="name" angle={-12} textAnchor="end" height={42}/>
          <YAxis domain={[0,top]} ticks={ticks} tickFormatter={v=>v.toFixed(0)}>
            <Label content={({viewBox})=>{
              const {x=0,y=0,height=0}=viewBox||{}; const cx=x+12, cy=y+height/2;
              return (<text x={cx} y={cy} transform={`rotate(-90, ${cx}, ${cy})`} textAnchor="middle" fontSize={12} fontWeight={600} fill="#334155" style={{pointerEvents:"none"}}>Total hours over 15 Days</text>);
            }}/>
          </YAxis>
          <Tooltip formatter={(v,k)=>[fmt(v),k==="labourHours"?"Labour":"Onsite"]}/>
          <Legend/>
          <Bar dataKey="labourHours" name="Labour (hrs)" fill="#7c3aed" radius={[8,8,0,0]}>
            <LabelList dataKey="labourHours" formatter={v=>v?Number(v).toFixed(1):""} position="top"/>
          </Bar>
          <Bar dataKey="onsiteHours" name="Onsite (hrs)" fill="#06b6d4" radius={[8,8,0,0]}>
            <LabelList dataKey="onsiteHours" formatter={v=>v?Number(v).toFixed(1):""} position="top"/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
