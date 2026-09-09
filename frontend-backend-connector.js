/* Fasqoo real-backend connector
   Set API_BASE to your backend URL, e.g. "https://api.fasqoo.com"
*/
const API_BASE = window.FASQOO_API_BASE || "";
async function apiGet(path, params={}) {
  const qs=new URLSearchParams(params);
  const r=await fetch(API_BASE+path+"?"+qs.toString(),{headers:{Accept:"application/json"}});
  const d=await r.json().catch(()=>({ok:false,error:"Ungültige Backend-Antwort"}));
  if(!r.ok || d.ok===false) throw new Error(d.error||`HTTP ${r.status}`);
  return d;
}
