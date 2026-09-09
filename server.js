const express = require("express");
const rateLimit = require("express-rate-limit");
const dns = require("node:dns").promises;
const net = require("node:net");
const tls = require("node:tls");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { URL } = require("node:url");
const os = require("node:os");

const execFileAsync = promisify(execFile);
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

const limiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false });
app.use("/api/", limiter);

const PORT = Number(process.env.PORT || 3000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.sendStatus(204);
  next();
});

function bad(res,msg,status=400){ return res.status(status).json({ok:false,error:msg}); }

function isPrivateIPv4(ip){
  const p=ip.split(".").map(Number);
  if(p.length!==4 || p.some(n=>!Number.isInteger(n)||n<0||n>255)) return true;
  const n=(((p[0]<<24)>>>0)+(p[1]<<16)+(p[2]<<8)+p[3])>>>0;
  const ranges=[
    ["10.0.0.0",8],["100.64.0.0",10],["127.0.0.0",8],["169.254.0.0",16],
    ["172.16.0.0",12],["192.0.0.0",24],["192.0.2.0",24],["192.168.0.0",16],
    ["198.18.0.0",15],["198.51.100.0",24],["203.0.113.0",24],["224.0.0.0",4]
  ];
  return ranges.some(([base,bits])=>{
    const b=base.split(".").reduce((a,x)=>((a<<8)|Number(x))>>>0,0);
    const mask=bits===0?0:(0xffffffff<<(32-bits))>>>0;
    return (n&mask)===(b&mask);
  });
}

function isBlockedIPv6(ip){
  const x=ip.toLowerCase();
  return x==="::1" || x==="::" || x.startsWith("fc") || x.startsWith("fd") ||
         x.startsWith("fe8") || x.startsWith("fe9") || x.startsWith("fea") || x.startsWith("feb");
}

async function resolvePublic(host){
  if(!host || host.length>253) throw new Error("Ungültiger Hostname");
  if(net.isIP(host)){
    if(net.isIP(host)===4 && isPrivateIPv4(host)) throw new Error("Private/reservierte IPv4-Ziele sind gesperrt");
    if(net.isIP(host)===6 && isBlockedIPv6(host)) throw new Error("Private/reservierte IPv6-Ziele sind gesperrt");
    return host;
  }
  const addrs=await dns.lookup(host,{all:true});
  if(!addrs.length) throw new Error("Hostname konnte nicht aufgelöst werden");
  if(addrs.some(a=>(a.family===4&&isPrivateIPv4(a.address))||(a.family===6&&isBlockedIPv6(a.address))))
    throw new Error("Hostname zeigt auf ein privates/reserviertes Ziel");
  return addrs[0].address;
}

function validHostname(h){
  return /^[a-zA-Z0-9.-]{1,253}$/.test(h) && !h.includes("..");
}

app.get("/api/health",(req,res)=>res.json({ok:true,service:"fasqoo-network-backend",time:new Date().toISOString()}));

app.get("/api/ping", async (req,res)=>{
  const host=String(req.query.host||"").trim();
  if(!validHostname(host) && !net.isIP(host)) return bad(res,"Ungültiges Ziel");
  try{
    await resolvePublic(host);
    const args=process.platform==="win32" ? ["-n","4","-w","3000",host] : ["-c","4","-W","3",host];
    const t=Date.now();
    const {stdout,stderr}=await execFileAsync(process.platform==="win32"?"ping":"ping",args,{timeout:16000,maxBuffer:64*1024});
    const combined=(stdout+"\n"+stderr).trim();
    const times=[...combined.matchAll(/time[=<]\s*([0-9.]+)\s*ms/gi)].map(m=>Number(m[1]));
    const loss=(combined.match(/(\d+(?:\.\d+)?)%\s*(?:packet )?loss/i)||[])[1];
    res.json({ok:true,host,elapsedMs:Date.now()-t,packets:times.length,timesMs:times,packetLossPercent:loss?Number(loss):null,raw:combined});
  }catch(e){ return bad(res,"Ping fehlgeschlagen oder Ziel nicht erreichbar",502); }
});

app.get("/api/port", async (req,res)=>{
  const host=String(req.query.host||"").trim();
  const port=Number(req.query.port);
  if((!validHostname(host)&&!net.isIP(host))||!Number.isInteger(port)||port<1||port>65535) return bad(res,"Ungültiger Host oder Port");
  try{ await resolvePublic(host); }catch(e){return bad(res,e.message,403);}
  const started=Date.now();
  const socket=new net.Socket();
  let done=false;
  const finish=(result)=>{if(done)return;done=true;socket.destroy();res.json({ok:true,host,port,...result,latencyMs:Date.now()-started});};
  socket.setTimeout(5000);
  socket.once("connect",()=>finish({state:"open"}));
  socket.once("timeout",()=>finish({state:"timeout"}));
  socket.once("error",(e)=>finish({state:["ECONNREFUSED","EHOSTUNREACH","ENETUNREACH"].includes(e.code)?"closed_or_unreachable":"error",code:e.code||"ERROR"}));
  socket.connect(port,host);
});

app.get("/api/tls", async (req,res)=>{
  let host=String(req.query.host||"").trim().replace(/^https?:\/\//,"").split("/")[0];
  if(!validHostname(host)&&!net.isIP(host)) return bad(res,"Ungültiger Host");
  try{ await resolvePublic(host); }catch(e){return bad(res,e.message,403);}
  const started=Date.now();
  const socket=tls.connect({host,port:443,servername:host,rejectUnauthorized:false,timeout:7000},()=>{
    const cert=socket.getPeerCertificate(true);
    const out={ok:true,host,authorized:socket.authorized,authorizationError:socket.authorizationError||null,
      protocol:socket.getProtocol(),cipher:socket.getCipher(),latencyMs:Date.now()-started,
      certificate:{subject:cert.subject||null,issuer:cert.issuer||null,validFrom:cert.valid_from||null,validTo:cert.valid_to||null,
      serialNumber:cert.serialNumber||null,fingerprint256:cert.fingerprint256||null}};
    socket.end();res.json(out);
  });
  socket.on("timeout",()=>{socket.destroy();bad(res,"TLS Timeout",504)});
  socket.on("error",e=>bad(res,"TLS Fehler: "+e.message,502));
});

app.get("/api/traceroute", async (req,res)=>{
  const host=String(req.query.host||"").trim();
  if(!validHostname(host)&&!net.isIP(host)) return bad(res,"Ungültiges Ziel");
  try{await resolvePublic(host);}catch(e){return bad(res,e.message,403);}
  const cmd=process.platform==="win32"?"tracert":"traceroute";
  const args=process.platform==="win32"?["-h","12","-w","1500",host]:["-m","12","-w","1",host];
  try{
    const {stdout,stderr}=await execFileAsync(cmd,args,{timeout:25000,maxBuffer:128*1024});
    res.json({ok:true,host,raw:(stdout+"\n"+stderr).trim()});
  }catch(e){bad(res,"Traceroute konnte nicht ausgeführt werden. Ist das Programm auf dem Server installiert?",501);}
});

app.get("/api/dns", async (req,res)=>{
  const host=String(req.query.host||"").trim();
  const type=String(req.query.type||"A").toUpperCase();
  if(!validHostname(host)) return bad(res,"Ungültiger Hostname");
  const allowed=["A","AAAA","MX","TXT","NS","SOA","CNAME","PTR"];
  if(!allowed.includes(type)) return bad(res,"Nicht unterstützter DNS-Typ");
  try{
    let data;
    if(type==="A") data=await dns.resolve4(host);
    else if(type==="AAAA") data=await dns.resolve6(host);
    else if(type==="MX") data=await dns.resolveMx(host);
    else if(type==="TXT") data=await dns.resolveTxt(host);
    else if(type==="NS") data=await dns.resolveNs(host);
    else if(type==="SOA") data=await dns.resolveSoa(host);
    else if(type==="CNAME") data=await dns.resolveCname(host);
    else if(type==="PTR") data=await dns.reverse(host);
    res.json({ok:true,host,type,data});
  }catch(e){bad(res,"DNS-Abfrage fehlgeschlagen: "+e.code,502);}
});

app.get("/api/http", async (req,res)=>{
  const raw=String(req.query.url||"").trim();
  let u;
  try{u=new URL(raw); if(!["http:","https:"].includes(u.protocol)) throw 0;}catch{return bad(res,"Nur http:// oder https:// URLs sind erlaubt");}
  try{await resolvePublic(u.hostname);}catch(e){return bad(res,e.message,403);}
  // Use curl when available so redirects and headers are measured server-side.
  try{
    const {stdout}=await execFileAsync("curl",["-k","-sS","-L","--max-time","12","-D","-","-o","/dev/null",u.toString()],{timeout:15000,maxBuffer:128*1024});
    res.json({ok:true,url:u.toString(),headers:stdout});
  }catch(e){bad(res,"HTTP-Test fehlgeschlagen",502);}
});

app.use(express.static(process.env.PUBLIC_DIR || "."));
app.use((err,req,res,next)=>res.status(500).json({ok:false,error:"Interner Serverfehler"}));
app.listen(PORT,()=>console.log(`Fasqoo backend listening on :${PORT}`));
