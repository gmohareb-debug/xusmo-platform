apply the import { useState, useRef, useEffect } from "react";
import {
  Zap, CheckCircle, ArrowRight, ArrowLeft, Star, ExternalLink, Copy,
  Lock, Phone, Mail, Clock, Shield, MessageSquare, Globe,
  Monitor, Smartphone, Tablet, Palette, Search, FileText,
  Eye, X, Check, Send, AlertCircle, AlertTriangle,
  BarChart2, Instagram, Layers, Sparkles, Crown, Package, ShoppingCart,
  Info, Layout, CreditCard, Calendar, MessageCircle, Bell,
  Users, Activity, RefreshCw, ChevronRight,
  Database, DollarSign, Plus, CheckCircle2, XCircle,
  Home, List, Cpu, Plug, EyeOff, HardDrive
} from "lucide-react";

const CL = {
  bg:"#FAF9F5", surface:"#FFFFFF", sidebar:"#F0EDE6", hover:"#E8E3DA",
  brand:"#CC6B2E", brandBg:"rgba(204,107,46,0.08)", brandBdr:"rgba(204,107,46,0.25)", brandHov:"#B85D24",
  border:"#E5DDD0", borderHi:"#D0C4B4",
  txt:"#1A1A1A", txtMid:"#5C5247", txtDim:"#9C8E82",
  green:"#2D7D46", greenBg:"rgba(45,125,70,0.08)", greenBdr:"rgba(45,125,70,0.2)",
  red:"#C0392B", redBg:"rgba(192,57,43,0.08)", redBdr:"rgba(192,57,43,0.2)",
  amber:"#B8760A", amberBg:"rgba(184,118,10,0.08)", amberBdr:"rgba(184,118,10,0.2)",
  blue:"#1A5F9E", blueBg:"rgba(26,95,158,0.08)", blueBdr:"rgba(26,95,158,0.2)",
  purple:"#6B4EBB", purpleBg:"rgba(107,78,187,0.08)",
  mono:"'JetBrains Mono','Fira Code',monospace",
  sans:"'DM Sans',system-ui,sans-serif",
  display:"'Syne','Space Grotesk',system-ui,sans-serif",
};

const FONTS=`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`;
const ANIM=`
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes glow{0%,100%{box-shadow:0 0 16px rgba(204,107,46,0.3)}50%{box-shadow:0 0 32px rgba(204,107,46,0.5)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-up{animation:fadeUp .45s ease both}
.dot-pulse span{animation:pulse 1.2s infinite}
.dot-pulse span:nth-child(2){animation-delay:.2s}
.dot-pulse span:nth-child(3){animation-delay:.4s}
.glow-brand{animation:glow 2s ease-in-out infinite}
.spin{animation:spin .8s linear infinite}
`;

const TRADES=["Plumbing","HVAC","Electrical","Roofing","Handyman","Landscaping","Painting","Cleaning","Restaurant","Salon","Gym","Real Estate","Photography","Consulting","Dental"];
const BASE_PRICE=11.99;

const STUDIO_TEMPLATES=[
  {id:"slate-pro",  name:"Slate Pro",   description:"Dark minimal, conversion-focused.", price:0,  category:"minimal",tags:["Dark","Minimal"],    primaryColor:"#b91c1c",bg:"#0c0a09",surface:"#1c1917",border:"#292524",textPrimary:"#fafaf9",textMuted:"#a8a29e",fontDisplay:"Syne",          fontBody:"Outfit",        preview:{bg:"#0c0a09",accent:"#b91c1c",card:"#1c1917"}},
  {id:"clean-light",name:"Clean Light", description:"Bright, airy, trustworthy.",        price:0,  category:"minimal",tags:["Light","Clean"],      primaryColor:"#1e40af",bg:"#f8fafc",surface:"#ffffff",border:"#e2e8f0",textPrimary:"#0f172a",textMuted:"#64748b",fontDisplay:"Space Grotesk", fontBody:"Outfit",        preview:{bg:"#f8fafc",accent:"#1e40af",card:"#ffffff"}},
  {id:"local-hero", name:"Local Hero",  description:"Warm, community-focused.",          price:0,  category:"warm",   tags:["Warm","Community"],   primaryColor:"#b45309",bg:"#1c1009",surface:"#2a1c0c",border:"#3d2810",textPrimary:"#fef3c7",textMuted:"#d97706",fontDisplay:"Playfair Display",fontBody:"Outfit",        preview:{bg:"#1c1009",accent:"#d97706",card:"#2a1c0c"}},
  {id:"fresh-green",name:"Fresh Start", description:"White with bold green accents.",    price:0,  category:"bright", tags:["Light","Fresh"],      primaryColor:"#15803d",bg:"#f0fdf4",surface:"#ffffff",border:"#dcfce7",textPrimary:"#14532d",textMuted:"#4b7a5a",fontDisplay:"Space Grotesk", fontBody:"Outfit",        preview:{bg:"#f0fdf4",accent:"#15803d",card:"#ffffff"}},
  {id:"luxe-dark",  name:"Luxe Dark",   description:"Sophisticated black with gold.",    price:49, category:"premium",tags:["Premium","Luxury"],   primaryColor:"#b45309",bg:"#0a0a0a",surface:"#111111",border:"#222222",textPrimary:"#f5f0e8",textMuted:"#8a7a6a",fontDisplay:"Playfair Display",fontBody:"Outfit",        preview:{bg:"#0a0a0a",accent:"#b45309",card:"#111111"}},
  {id:"bold-impact",name:"Bold Impact", description:"High-contrast, maximalist.",        price:29, category:"bold",   tags:["Bold","Energy"],      primaryColor:"#dc2626",bg:"#09090b",surface:"#18181b",border:"#3f3f46",textPrimary:"#ffffff",textMuted:"#a1a1aa",fontDisplay:"Syne",          fontBody:"Space Grotesk", preview:{bg:"#09090b",accent:"#dc2626",card:"#18181b"}},
  {id:"modern-sage",name:"Modern Sage", description:"Neutrals with sage green.",         price:29, category:"premium",tags:["Premium","Elegant"],  primaryColor:"#4d7c6a",bg:"#f5f0eb",surface:"#ffffff",border:"#e8ddd4",textPrimary:"#2d2520",textMuted:"#7a6a60",fontDisplay:"Playfair Display",fontBody:"Outfit",        preview:{bg:"#f5f0eb",accent:"#4d7c6a",card:"#ffffff"}},
  {id:"neon-night", name:"Neon Night",  description:"Dark with electric accents.",       price:29, category:"bold",   tags:["Dark","Electric"],    primaryColor:"#8b5cf6",bg:"#07030f",surface:"#0f0a1e",border:"#1e1040",textPrimary:"#f0e8ff",textMuted:"#8b7aaa",fontDisplay:"Syne",          fontBody:"Outfit",        preview:{bg:"#07030f",accent:"#8b5cf6",card:"#0f0a1e"}},
  {id:"glass-tech", name:"Glass Tech",  description:"Glassmorphism, deep blues.",        price:49, category:"premium",tags:["Premium","Tech"],     primaryColor:"#3b82f6",bg:"#020617",surface:"rgba(30,40,80,0.5)",border:"rgba(59,130,246,0.2)",textPrimary:"#e2e8f0",textMuted:"#7c9cbf",fontDisplay:"Space Grotesk",fontBody:"Outfit", preview:{bg:"#020617",accent:"#3b82f6",card:"rgba(30,40,80,0.5)"}},
  {id:"urban-mono", name:"Urban Mono",  description:"Brutalist grid, monochrome.",       price:49, category:"premium",tags:["Premium","Brutalist"], primaryColor:"#000000",bg:"#ffffff",surface:"#f5f5f5",border:"#000000",textPrimary:"#000000",textMuted:"#555555",fontDisplay:"Space Grotesk", fontBody:"Space Grotesk", preview:{bg:"#ffffff",accent:"#000000",card:"#f5f5f5"}},
];

const STUDIO_FEATURES=[
  {id:"booking",   name:"Online Booking",    desc:"Appointment calendar with confirmations.",   icon:Calendar,      price:9,  period:"mo",      category:"bookings", popular:true,  includes:["Booking calendar","Email reminders","Google Calendar sync"]},
  {id:"reviews",   name:"Google Reviews",    desc:"Auto-display your Google reviews daily.",    icon:Star,          price:0,  period:"mo",      category:"trust",    popular:false, includes:["Live reviews feed","Star ratings","Auto-refresh"]},
  {id:"chat",      name:"Live Chat",         desc:"Real-time chat — notified on your phone.",   icon:MessageCircle, price:6,  period:"mo",      category:"leads",    popular:true,  includes:["Chat bubble","Mobile notifications","Lead capture"]},
  {id:"payments",  name:"Online Payments",   desc:"Accept deposits and invoices via Stripe.",   icon:CreditCard,    price:12, period:"mo",      category:"ecommerce",popular:false, includes:["Stripe integration","Invoice gen","Deposits"]},
  {id:"instagram", name:"Instagram Feed",    desc:"Embed your latest posts as a live gallery.", icon:Instagram,     price:4,  period:"mo",      category:"social",   popular:false, includes:["Live grid","Auto-sync","Click-to-open"]},
  {id:"popup",     name:"Lead Pop-up",       desc:"Exit-intent and timed pop-ups.",             icon:Bell,          price:5,  period:"mo",      category:"leads",    popular:false, includes:["Exit-intent","Timed pop-ups","Email capture"]},
  {id:"analytics", name:"Analytics",         desc:"Traffic, heatmaps, conversion tracking.",    icon:BarChart2,     price:7,  period:"mo",      category:"analytics",popular:false, includes:["Traffic dashboard","Heatmaps","Lead source"]},
  {id:"email",     name:"Email Marketing",   desc:"Build your list, send campaigns.",           icon:Mail,          price:10, period:"mo",      category:"marketing",popular:false, includes:["List building","Sequences","Tracking"]},
  {id:"seo-pro",   name:"SEO Pro Tools",    desc:"Local SEO, schema markup, rank tracking.",   icon:Search,        price:8,  period:"mo",      category:"seo",      popular:false, includes:["GB sync","Rank tracking","Monthly report"]},
  {id:"sms",       name:"SMS Notifications", desc:"Booking confirmations, reminders, follow-ups.",icon:MessageSquare,price:8, period:"mo",      category:"bookings", popular:false, includes:["Booking reminders","Confirmation texts","Custom messages","2-way SMS"]},
  {id:"loyalty",   name:"Loyalty Program",   desc:"Points, stamps, rewards for repeat clients.",icon:Crown,         price:15, period:"mo",      category:"marketing",popular:false, includes:["Digital card","Points system","Referrals"]},
  {id:"video-hero",name:"Video Hero",        desc:"Looping background video in your hero.",     icon:Layers,        price:19, period:"one-time",category:"design",   popular:false, includes:["Video upload","CDN hosted","Mobile fallback"]},
];

const FEAT_CATS=[{id:"all",label:"All"},{id:"leads",label:"Leads"},{id:"bookings",label:"Bookings"},{id:"trust",label:"Trust"},{id:"ecommerce",label:"Payments"},{id:"marketing",label:"Marketing"},{id:"analytics",label:"Analytics"},{id:"seo",label:"SEO"},{id:"design",label:"Design"},{id:"social",label:"Social"}];

const buildSP=(d)=>`You are the AI Website Consultant for Xusmo. Build professional websites through quick interviews.
Client: ${d.trade} business called "${d.name}" in ${d.city}.
FLOW (4-5 exchanges MAX):
1. GREET: Confirm details, suggest tagline.
2. SERVICES: Suggest 5 defaults, confirm/adjust.
3. TRUST: Years, licenses, color preference.
4. WRAP UP: Summarize, ask "Ready to see your site?"
RULES: Max 2 questions/message. Under 5 sentences. Sound human.
When client says ready, output:
|||SITE_DATA|||
{"businessName":"${d.name}","tradeType":"${d.trade}","city":"${d.city}","tagline":"...","services":[{"name":"...","desc":"One sentence."},{"name":"...","desc":"..."},{"name":"...","desc":"..."},{"name":"...","desc":"..."},{"name":"...","desc":"..."}],"hours":"Mon–Fri 7am–6pm, Sat 8am–2pm","yearsInBusiness":"5","licenses":"Licensed & Insured","phone":"(416) 555-0199","email":"info@business.ca","address":"123 Main St, ${d.city}","about":"Two compelling sentences about the business.","testimonials":[{"name":"Mike T.","text":"Realistic review text here.","rating":5},{"name":"Sarah K.","text":"Another great review.","rating":5},{"name":"James L.","text":"Third review.","rating":5}],"pages":["Home","Services","About","Contact"],"seoTitle":"${d.name} | ${d.trade} in ${d.city}","seoDescription":"Professional ${d.trade} services in ${d.city}.","seoKeywords":"${d.trade.toLowerCase()} ${d.city.toLowerCase()}"}
|||END_DATA|||`;

// ── Admin Data ─────────────────────────────────────────────
const MOCK_SITES=[
  {id:"s1",name:"Fast Pipes Toronto",  trade:"Plumbing",   city:"Toronto",    status:"LIVE",    addons:4,mrr:45.99,agentStatus:"idle",   domain:"fastpipes.ca",       wpStatus:"ok"},
  {id:"s2",name:"Chill HVAC Ottawa",   trade:"HVAC",       city:"Ottawa",     status:"BUILDING",addons:2,mrr:23.99,agentStatus:"running",domain:null,                 wpStatus:"provisioning"},
  {id:"s3",name:"Volt Electric Co",    trade:"Electrical", city:"Mississauga",status:"LIVE",    addons:6,mrr:67.99,agentStatus:"idle",   domain:"voltelectric.ca",    wpStatus:"ok"},
  {id:"s4",name:"Green Lawn Pros",     trade:"Landscaping",city:"Brampton",   status:"FAILED",  addons:0,mrr:0,    agentStatus:"failed", domain:null,                 wpStatus:"error"},
  {id:"s5",name:"Brush & Roll Paints", trade:"Painting",   city:"Hamilton",   status:"LIVE",    addons:3,mrr:34.99,agentStatus:"idle",   domain:"brushroll.ca",       wpStatus:"ok"},
  {id:"s6",name:"Roya Salon & Spa",    trade:"Salon",      city:"Toronto",    status:"LIVE",    addons:5,mrr:56.99,agentStatus:"running",domain:"royasalon.ca",       wpStatus:"ok"},
  {id:"s7",name:"Urban Fit Gym",       trade:"Gym",        city:"Vancouver",  status:"BUILDING",addons:1,mrr:11.99,agentStatus:"running",domain:null,                 wpStatus:"provisioning"},
  {id:"s8",name:"Marco's Ristorante",  trade:"Restaurant", city:"Toronto",    status:"LIVE",    addons:7,mrr:78.99,agentStatus:"idle",   domain:"marcosristorante.ca",wpStatus:"ok"},
];
const MOCK_LOGS=[
  {id:"l1",siteId:"s2",site:"Chill HVAC Ottawa",  agent:"builder.agent",step:"Cloning WordPress environment", status:"running",ts:"2m ago", detail:"docker pull xusmo/wp-golden:v3 ..."},
  {id:"l2",siteId:"s7",site:"Urban Fit Gym",       agent:"builder.agent",step:"Applying Neon Night theme",     status:"running",ts:"4m ago", detail:"wp theme activate kadence ..."},
  {id:"l3",siteId:"s6",site:"Roya Salon & Spa",    agent:"seo.agent",   step:"Generating local schema markup", status:"running",ts:"1m ago", detail:"wp yoast sitemap generate ..."},
  {id:"l4",siteId:"s1",site:"Fast Pipes Toronto",  agent:"addon.agent", step:"Activating Google Reviews Feed", status:"done",   ts:"12m ago",detail:"wp plugin activate wp-google-review-slider"},
  {id:"l5",siteId:"s3",site:"Volt Electric Co",    agent:"addon.agent", step:"Configuring Tidio Live Chat",    status:"done",   ts:"34m ago",detail:"wp option update tidio_public_key '****'"},
  {id:"l6",siteId:"s4",site:"Green Lawn Pros",     agent:"builder.agent",step:"Container allocation timeout",  status:"failed", ts:"1h ago",  detail:"Error: SSH timeout after 30s"},
];
const MOCK_ADDONS=[
  {siteId:"s4",name:"Online Booking", status:"FAILED",      attempts:3,error:"Plugin install timeout"},
  {siteId:"s2",name:"Google Reviews", status:"INSTALLING",  attempts:1,error:null},
  {siteId:"s6",name:"SEO Pro Tools",  status:"NEEDS_CONFIG",attempts:1,error:null},
];

const CLIENTS=[
  {id:1, biz:"Mario's Plumbing",     owner:"Mario Rossi",   email:"mario@mariosplumbing.ca",  plan:"Pro",    url:"mariosplumbing.ca",    industry:"Plumbing",   status:"healthy",score:92,wp:"6.7.2",wpOk:true, theme:"1.2.0",themeOk:true, response:320,ssl:84,backup:"2h ago", mrr:49,built:"Jan 12",user:"sf_mario",  plugins:[{name:"Yoast SEO",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",v:"2.2",ok:true,required:false,active:true}],vps:"vps-01"},
  {id:2, biz:"Sakura Sushi",         owner:"Yuki Tanaka",   email:"yuki@sakurasushi.ca",       plan:"Pro",    url:"sakurasushi.ca",       industry:"Restaurant", status:"healthy",score:88,wp:"6.7.2",wpOk:true, theme:"1.2.0",themeOk:true, response:410,ssl:72,backup:"4h ago", mrr:49,built:"Jan 15",user:"sf_yuki",   plugins:[{name:"Yoast SEO",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",v:"2.2",ok:true,required:false,active:true}],vps:"vps-01"},
  {id:3, biz:"Downtown Legal",       owner:"Jennifer Park", email:"jen@downtownlegal.ca",      plan:"Starter",url:"downtownlegal.ca",     industry:"Legal",      status:"critical",score:35,wp:"6.7.0",wpOk:false,wpUpdate:"6.7.2",theme:"1.1.0",themeOk:false,response:2100,ssl:-3,backup:"48h ago",mrr:29,built:"Dec 3", user:"admin",     plugins:[{name:"Yoast SEO",v:"21.8",ok:false,update:"22.3",required:true,active:true},{name:"Contact Form 7",v:"5.8",ok:false,update:"5.9.8",required:true,active:true},{name:"Wordfence",v:"7.11",ok:false,banned:true,required:false,active:true}],vps:"vps-02"},
  {id:4, biz:"Elena Photography",    owner:"Elena Vasquez", email:"elena@elenavphoto.ca",      plan:"Growth", url:"elenavphoto.ca",       industry:"Photography",status:"healthy",score:95,wp:"6.7.2",wpOk:true, theme:"1.2.0",themeOk:true, response:280,ssl:90,backup:"1h ago",  mrr:79,built:"Jan 20",user:"sf_elena",  plugins:[{name:"Yoast SEO",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",v:"2.2",ok:true,required:false,active:true}],vps:"vps-01"},
  {id:5, biz:"Fresh Cuts Salon",     owner:"Sarah Mitchell",email:"sarah@freshcuts.ca",        plan:"Pro",    url:"freshcutssalon.ca",    industry:"Salon",      status:"healthy",score:86,wp:"6.7.2",wpOk:true, theme:"1.2.0",themeOk:true, response:390,ssl:55,backup:"3h ago", mrr:49,built:"Jan 8", user:"sf_sarah",  plugins:[{name:"Yoast SEO",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",v:"2.2",ok:true,required:false,active:true}],vps:"vps-02"},
  {id:6, biz:"Joe's Auto Repair",    owner:"Joe Colombo",   email:"joe@joesauto.ca",           plan:"Pro",    url:"joesautorepair.ca",    industry:"Auto Repair",status:"warning", score:68,wp:"6.7.2",wpOk:true, theme:"1.2.0",themeOk:true, response:580,ssl:60,backup:"6h ago", mrr:49,built:"Dec 20",user:"sf_joe",    plugins:[{name:"Yoast SEO",v:"22.1",ok:false,update:"22.3",required:true,active:true},{name:"Contact Form 7",v:"5.9.8",ok:true,required:true,active:true},{name:"WP Mail SMTP",v:"3.8",ok:false,update:"3.9",required:false,active:false}],vps:"vps-01"},
  {id:7, biz:"Bright Smiles Dental", owner:"Dr. Amy Chen",  email:"amy@brightsmiles.ca",       plan:"Growth", url:"brightsmilesdental.ca",industry:"Dental",     status:"healthy",score:90,wp:"6.7.2",wpOk:true, theme:"1.2.0",themeOk:true, response:310,ssl:88,backup:"2h ago", mrr:79,built:"Jan 25",user:"sf_amy",    plugins:[{name:"Yoast SEO",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",v:"2.2",ok:true,required:false,active:true}],vps:"vps-01"},
  {id:8, biz:"GreenThumb",           owner:"Marcus Brown",  email:"marcus@greenthumb.ca",      plan:"Starter",url:"greenthumbland.ca",    industry:"Landscaping",status:"healthy",score:84,wp:"6.7.2",wpOk:true, theme:"1.2.0",themeOk:true, response:350,ssl:45,backup:"5h ago", mrr:29,built:"Feb 1", user:"sf_marcus", plugins:[{name:"Yoast SEO",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",v:"2.2",ok:true,required:false,active:true}],vps:"vps-02"},
  {id:9, biz:"Peak Fitness Gym",     owner:"Ryan Torres",   email:"ryan@peakfitness.ca",       plan:"Pro",    url:"peakfitnessgym.ca",    industry:"Gym",        status:"warning", score:62,wp:"6.7.2",wpOk:true, theme:"1.1.0",themeOk:false,response:720,ssl:30,backup:"12h ago",mrr:49,built:"Feb 5", user:"sf_ryan",   plugins:[{name:"Yoast SEO",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",v:"5.9",ok:false,update:"5.9.8",required:true,active:true},{name:"Safe SVG",v:"2.2",ok:true,required:false,active:true}],vps:"vps-02"},
  {id:10,biz:"Paws & Claws Vet",     owner:"Dr. Lisa Wong", email:"lisa@pawsclaws.ca",         plan:"Pro",    url:"pawsandclawsvet.ca",   industry:"Veterinary", status:"healthy",score:91,wp:"6.7.2",wpOk:true, theme:"1.2.0",themeOk:true, response:300,ssl:78,backup:"2h ago", mrr:49,built:"Jan 18",user:"sf_lisa",   plugins:[{name:"Yoast SEO",v:"22.3",ok:true,required:true,active:true},{name:"Contact Form 7",v:"5.9.8",ok:true,required:true,active:true},{name:"Safe SVG",v:"2.2",ok:true,required:false,active:true}],vps:"vps-01"},
];

// ── Primitives ─────────────────────────────────────────────
const ASC={running:{color:CL.purple,bg:CL.purpleBg,border:"rgba(107,78,187,0.25)"},done:{color:CL.green,bg:CL.greenBg,border:CL.greenBdr},failed:{color:CL.red,bg:CL.redBg,border:CL.redBdr},idle:{color:CL.txtDim,bg:"rgba(156,142,130,0.08)",border:"rgba(156,142,130,0.2)"}};
const SSC={LIVE:{color:CL.green,bg:CL.greenBg,border:CL.greenBdr},BUILDING:{color:CL.purple,bg:CL.purpleBg,border:"rgba(107,78,187,0.25)"},FAILED:{color:CL.red,bg:CL.redBg,border:CL.redBdr},INSTALLING:{color:CL.purple,bg:CL.purpleBg,border:"rgba(107,78,187,0.25)"},NEEDS_CONFIG:{color:CL.amber,bg:CL.amberBg,border:CL.amberBdr},ACTIVE:{color:CL.green,bg:CL.greenBg,border:CL.greenBdr}};

const Bdg=({label,color,bg,border})=>(
  <span style={{display:"inline-flex",alignItems:"center",padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"monospace",color,background:bg,border:`1px solid ${border}`}}>{label}</span>
);
const SBdg=({status})=>{const s=SSC[status]||SSC.FAILED;return <Bdg label={status} color={s.color} bg={s.bg} border={s.border}/>;};
const AgentDot=({status})=>{const c=ASC[status]||ASC.idle;return(
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 7px",borderRadius:20,background:c.bg,border:`1px solid ${c.border}`,fontSize:10,color:c.color,fontFamily:"monospace",fontWeight:700}}>
    {status==="running"&&<span style={{width:6,height:6,borderRadius:"50%",background:c.color,animation:"pulse 1s infinite"}}/>}
    {status}
  </span>
);};

// ── Admin Dashboard ────────────────────────────────────────
function OperatorDashboard(){
  const [sel,setSel]=useState(null);
  const [lf,setLf]=useState("all");
  const totalMRR=MOCK_SITES.reduce((s,x)=>s+x.mrr,0);
  const live=MOCK_SITES.filter(s=>s.status==="LIVE").length;
  const running=MOCK_LOGS.filter(l=>l.status==="running").length;
  const failed=MOCK_SITES.filter(s=>s.status==="FAILED").length;
  const logs=lf==="all"?MOCK_LOGS:MOCK_LOGS.filter(l=>l.status===lf);
  const Stat=({icon:I,label,value,sub,color})=>(
    <div style={{background:CL.surface,border:`1px solid ${CL.border}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:38,height:38,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><I size={16} style={{color}}/></div>
      <div><div style={{fontSize:20,fontWeight:800,color:CL.txt,lineHeight:1}}>{value}</div><div style={{fontSize:11,color:CL.txtMid,marginTop:1}}>{label}</div>{sub&&<div style={{fontSize:10,color:CL.txtDim,fontFamily:"monospace",marginTop:1}}>{sub}</div>}</div>
    </div>
  );
  return(
    <div style={{flex:1,overflowY:"auto",padding:"22px 24px",background:CL.bg}}>
      <h1 style={{fontSize:20,fontWeight:800,color:CL.txt,fontFamily:CL.display,margin:"0 0 3px"}}>Operator Dashboard</h1>
      <p style={{fontSize:12,color:CL.txtMid,margin:"0 0 18px"}}>All customer sites, agents, and addon installs — live.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
        <Stat icon={Globe} label="Live Sites" value={live} sub={`${MOCK_SITES.filter(s=>s.status==="BUILDING").length} building`} color={CL.green}/>
        <Stat icon={DollarSign} label="Monthly Rev" value={`$${totalMRR.toFixed(0)}`} sub="total MRR" color={CL.brand}/>
        <Stat icon={Users} label="Total Sites" value={MOCK_SITES.length} sub={`${failed} failed`} color={CL.blue}/>
        <Stat icon={Activity} label="Agents Running" value={running} sub="live now" color={CL.purple}/>
        <Stat icon={AlertTriangle} label="Needs Attention" value={failed+MOCK_ADDONS.filter(a=>a.status==="FAILED").length} sub="action required" color={CL.red}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:14,marginBottom:14}}>
        <div style={{background:CL.surface,border:`1px solid ${CL.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${CL.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:700,color:CL.txt}}>Customer Sites</span>
            <Bdg label={`${MOCK_SITES.length} total`} color={CL.brand} bg={CL.brandBg} border={CL.brandBdr}/>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:CL.sidebar}}>{["Site","Trade","Status","MRR","Agent",""].map((h,i)=><th key={i} style={{padding:"7px 12px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:CL.txtDim,fontFamily:"monospace",borderBottom:`1px solid ${CL.border}`}}>{h}</th>)}</tr></thead>
            <tbody>{MOCK_SITES.map((site,i)=>{const c=SSC[site.status]||SSC.LIVE;return(
              <tr key={site.id} onClick={()=>setSel(sel===site.id?null:site.id)} style={{borderBottom:`1px solid ${CL.border}`,cursor:"pointer",background:sel===site.id?CL.sidebar:"transparent"}}>
                <td style={{padding:"9px 12px",fontWeight:600,color:CL.txt}}>{site.name}</td>
                <td style={{padding:"9px 12px",color:CL.txtDim,fontSize:11}}>{site.trade}</td>
                <td style={{padding:"9px 12px"}}><Bdg label={site.status} color={c.color} bg={c.bg} border={c.border}/></td>
                <td style={{padding:"9px 12px",color:CL.brand,fontFamily:"monospace",fontWeight:700}}>${site.mrr}</td>
                <td style={{padding:"9px 12px"}}><AgentDot status={site.agentStatus}/></td>
                <td style={{padding:"9px 12px"}}><ChevronRight size={13} style={{color:CL.txtDim,transform:sel===site.id?"rotate(90deg)":"none",transition:".2s"}}/></td>
              </tr>
            );})}</tbody>
          </table>
          {sel&&(()=>{const site=MOCK_SITES.find(s=>s.id===sel);const sa=MOCK_ADDONS.filter(a=>a.siteId===sel);return(
            <div style={{padding:14,borderTop:`2px solid ${CL.brand}`,background:CL.brandBg}}>
              <div style={{display:"flex",gap:20,marginBottom:10,flexWrap:"wrap"}}>
                <div><div style={{fontSize:9,fontWeight:700,color:CL.txtDim,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>Domain</div><span style={{fontFamily:"monospace",fontSize:11,color:CL.txt}}>{site.domain||"not connected"}</span></div>
                <div><div style={{fontSize:9,fontWeight:700,color:CL.txtDim,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>WP Status</div><span style={{fontFamily:"monospace",fontSize:11,color:site.wpStatus==="ok"?CL.green:CL.amber}}>{site.wpStatus}</span></div>
              </div>
              {sa.map((a,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",background:CL.surface,borderRadius:6,border:`1px solid ${CL.border}`,marginBottom:4}}><SBdg status={a.status}/><span style={{fontSize:11,color:CL.txt,flex:1}}>{a.name}</span>{a.error&&<span style={{fontSize:10,color:CL.red,fontFamily:"monospace"}}>{a.error}</span>}{a.status==="FAILED"&&<button style={{padding:"2px 8px",borderRadius:5,border:`1px solid ${CL.brand}`,background:CL.brandBg,color:CL.brand,fontSize:10,fontWeight:600,cursor:"pointer"}}>Retry</button>}</div>)}
              {site.status==="FAILED"&&<div style={{marginTop:10,display:"flex",gap:8}}><button style={{padding:"5px 14px",borderRadius:7,background:CL.brand,color:"#fff",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>Rebuild Site</button></div>}
            </div>
          );})()}
        </div>
        <div style={{background:CL.surface,border:`1px solid ${CL.border}`,borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"12px 14px",borderBottom:`1px solid ${CL.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <span style={{fontSize:13,fontWeight:700,color:CL.txt}}>Agent Logs</span>
            <div style={{display:"flex",gap:3}}>{["all","running","done","failed"].map(f=><button key={f} onClick={()=>setLf(f)} style={{padding:"2px 7px",borderRadius:4,border:`1px solid ${lf===f?CL.brand:CL.border}`,background:lf===f?CL.brandBg:"transparent",color:lf===f?CL.brand:CL.txtDim,fontSize:9,fontFamily:"monospace",cursor:"pointer",fontWeight:700}}>{f}</button>)}</div>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            {logs.map((log,i)=>{const c=ASC[log.status]||ASC.idle;return(
              <div key={log.id} style={{padding:"9px 12px",borderBottom:`1px solid ${CL.border}`,background:i%2===0?"transparent":CL.sidebar+"60"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:9,fontWeight:700,color:c.color,fontFamily:"monospace",background:c.bg,padding:"1px 5px",borderRadius:3}}>{log.agent}</span><span style={{fontSize:10,color:CL.txtDim,fontFamily:"monospace",marginLeft:"auto"}}>{log.ts}</span></div>
                <div style={{fontSize:11,fontWeight:600,color:CL.txt,marginBottom:1}}>{log.site}</div>
                <div style={{fontSize:10,color:CL.txtMid,marginBottom:3}}>{log.step}</div>
                <div style={{fontSize:9,color:CL.txtDim,fontFamily:"monospace",background:"#F5F0EA",padding:"3px 7px",borderRadius:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.detail}</div>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Client Sites ───────────────────────────────────────────
function ClientSitesSection(){
  const [sel,setSel]=useState(3);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [showPass,setShowPass]=useState(false);
  const stColor={healthy:CL.green,warning:CL.amber,critical:CL.red};
  const filtered=CLIENTS.filter(c=>(filter==="all"||(filter==="issues"&&c.status!=="healthy"))&&(!search||c.biz.toLowerCase().includes(search.toLowerCase())));
  const site=CLIENTS.find(c=>c.id===sel);
  const issues=site?site.plugins.filter(p=>!p.ok):[];
  return(
    <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",background:CL.bg}}>
      <div style={{background:CL.surface,borderBottom:`1px solid ${CL.border}`,padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,fontSize:12}}>
          <span style={{fontWeight:700,color:CL.txt}}>{CLIENTS.length} client sites</span>
          <span style={{color:CL.txtDim}}>·</span><span style={{color:CL.green,fontWeight:600}}>{CLIENTS.filter(c=>c.status==="healthy").length} healthy</span>
          <span style={{color:CL.txtDim}}>·</span><span style={{color:CL.brand,fontWeight:700,fontFamily:"monospace"}}>${CLIENTS.reduce((a,c)=>a+c.mrr,0)}/mo MRR</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button style={{display:"flex",alignItems:"center",gap:4,background:CL.greenBg,color:CL.green,border:`1px solid ${CL.greenBdr}`,borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:500}}><RefreshCw size={11}/> Check All</button>
          <button style={{display:"flex",alignItems:"center",gap:4,background:CL.blueBg,color:CL.blue,border:`1px solid ${CL.blueBdr}`,borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:500}}><Plug size={11}/> Update All</button>
        </div>
      </div>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{width:240,borderRight:`1px solid ${CL.border}`,display:"flex",flexDirection:"column",flexShrink:0,background:CL.surface}}>
          <div style={{padding:"8px 10px",borderBottom:`1px solid ${CL.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:5,background:CL.sidebar,border:`1px solid ${CL.border}`,borderRadius:6,padding:"5px 9px",marginBottom:6}}><Search size={12} style={{color:CL.txtDim}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{background:"transparent",border:"none",color:CL.txt,outline:"none",fontSize:11,width:"100%"}}/></div>
            <div style={{display:"flex",gap:4}}>{[["all","All"],["issues","Issues"]].map(([k,l])=><button key={k} onClick={()=>setFilter(k)} style={{flex:1,padding:"3px 0",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:600,border:`1px solid ${filter===k?CL.brand:CL.border}`,background:filter===k?CL.brandBg:"transparent",color:filter===k?CL.brand:CL.txtDim}}>{l}</button>)}</div>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            {filtered.map(c=>{const pi=c.plugins.filter(p=>!p.ok).length;const ia=sel===c.id;return(
              <div key={c.id} onClick={()=>setSel(c.id)} style={{padding:"8px 10px",cursor:"pointer",borderBottom:`1px solid ${CL.border}40`,background:ia?CL.brandBg:"transparent",borderLeft:`3px solid ${ia?CL.brand:"transparent"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:stColor[c.status]}}/><div><div style={{fontSize:11,fontWeight:600,color:ia?CL.brand:CL.txt}}>{c.biz}</div><div style={{fontSize:9,color:CL.txtDim}}>{c.industry} · {c.plan}</div></div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:c.score>=80?CL.green:c.score>=60?CL.amber:CL.red}}>{c.score}</div>{pi>0&&<div style={{fontSize:8,color:c.plugins.some(p=>p.banned)?CL.red:CL.amber,fontWeight:600}}>{pi} issue{pi>1?"s":""}</div>}</div>
                </div>
              </div>
            );})}
          </div>
        </div>
        {site&&(
          <div style={{flex:1,overflowY:"auto",padding:18,background:CL.bg}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:stColor[site.status]}}/><h2 style={{fontSize:18,fontWeight:700,color:CL.txt,margin:0,fontFamily:CL.display}}>{site.biz}</h2><span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:stColor[site.status]+"18",color:stColor[site.status],fontWeight:600,textTransform:"uppercase"}}>{site.status}</span></div>
                <div style={{display:"flex",gap:12,marginTop:4,fontSize:11,color:CL.txtMid}}><span>{site.owner}</span><span style={{fontWeight:600,color:CL.brand}}>{site.plan} · ${site.mrr}/mo</span></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <a href="#" style={{display:"flex",alignItems:"center",gap:4,padding:"5px 9px",borderRadius:6,background:CL.greenBg,color:CL.green,border:`1px solid ${CL.greenBdr}`,fontSize:10,fontWeight:500,textDecoration:"none"}}><Globe size={11}/> Live Site</a>
                <a href="#" style={{display:"flex",alignItems:"center",gap:4,padding:"5px 9px",borderRadius:6,background:CL.blueBg,color:CL.blue,border:`1px solid ${CL.blueBdr}`,fontSize:10,fontWeight:500,textDecoration:"none"}}><ExternalLink size={11}/> WP Admin</a>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {/* Health */}
              <div style={{background:CL.surface,borderRadius:10,border:`1px solid ${CL.border}`,padding:14}}>
                <div style={{fontSize:12,fontWeight:700,color:CL.txt,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Activity size={13} style={{color:CL.brand}}/> Health <span style={{marginLeft:"auto",fontSize:18,fontWeight:800,color:site.score>=80?CL.green:site.score>=60?CL.amber:CL.red}}>{site.score}</span></div>
                {[{l:"WordPress",v:site.wp,ok:site.wpOk},{l:"Theme",v:site.theme,ok:site.themeOk},{l:"Response",v:`${site.response}ms`,ok:site.response<800},{l:"SSL Days",v:site.ssl<0?"EXPIRED":`${site.ssl}d`,ok:site.ssl>14},{l:"Backup",v:site.backup,ok:!site.backup.includes("48h")},{l:"VPS",v:site.vps,ok:true}].map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${CL.border}40`}}>
                    <span style={{color:CL.txtDim,fontSize:11}}>{r.l}</span>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{color:r.ok?CL.txt:CL.amber,fontWeight:r.ok?400:600,fontSize:11,fontFamily:"monospace"}}>{r.v}</span>
                      {r.ok?<CheckCircle2 size={10} style={{color:CL.green}}/>:<AlertTriangle size={10} style={{color:CL.amber}}/>}
                    </div>
                  </div>
                ))}
              </div>
              {/* Plugins */}
              <div style={{background:CL.surface,borderRadius:10,border:`1px solid ${CL.border}`,padding:14}}>
                <div style={{fontSize:12,fontWeight:700,color:CL.txt,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Plug size={13} style={{color:CL.blue}}/> Plugins {issues.length>0&&<Bdg label={`${issues.length} issue${issues.length>1?"s":""}`} color={CL.amber} bg={CL.amberBg} border={CL.amberBdr}/>}</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {site.plugins.map((p,i)=>(
                    <div key={i} style={{padding:"8px 10px",borderRadius:7,background:p.ok?CL.sidebar:p.banned?CL.redBg:CL.amberBg,border:`1px solid ${p.ok?CL.border:p.banned?CL.redBdr:CL.amberBdr}`}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <div><div style={{fontSize:11,fontWeight:600,color:CL.txt}}>{p.name}</div><div style={{display:"flex",gap:4,marginTop:2}}><span style={{fontSize:9,color:CL.txtDim,fontFamily:"monospace"}}>v{p.v}</span>{!p.active&&<span style={{fontSize:8,color:CL.red,fontWeight:600,background:CL.redBg,padding:"1px 4px",borderRadius:3}}>INACTIVE</span>}</div></div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                          {p.ok?<CheckCircle2 size={12} style={{color:CL.green}}/>:<XCircle size={12} style={{color:p.banned?CL.red:CL.amber}}/>}
                          {!p.ok&&p.update&&<button style={{fontSize:8,padding:"1px 5px",borderRadius:3,background:CL.amberBg,border:`1px solid ${CL.amberBdr}`,color:CL.amber,cursor:"pointer"}}>→ {p.update}</button>}
                          {p.banned&&<span style={{fontSize:8,color:CL.red,fontWeight:700}}>⚠ BANNED</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button style={{width:"100%",padding:"7px",borderRadius:7,background:CL.brandBg,border:`1px solid ${CL.brandBdr}`,color:CL.brand,cursor:"pointer",fontSize:10,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><Plus size={11}/> Add Plugin</button>
                </div>
              </div>
              {/* Access */}
              <div style={{background:CL.surface,borderRadius:10,border:`1px solid ${CL.border}`,padding:14}}>
                <div style={{fontSize:12,fontWeight:700,color:CL.txt,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Lock size={13} style={{color:CL.purple}}/> Access & Actions</div>
                <div style={{background:CL.sidebar,borderRadius:7,padding:10,marginBottom:12,border:`1px solid ${CL.border}`}}>
                  <div style={{fontSize:9,fontWeight:700,color:CL.txtDim,marginBottom:6,fontFamily:"monospace",letterSpacing:"0.1em"}}>WP CREDENTIALS</div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{color:CL.txtDim,fontSize:10}}>URL</span><a href="#" style={{color:CL.blue,textDecoration:"none",fontSize:10,display:"flex",alignItems:"center",gap:2}}>{site.url}/wp-admin<ExternalLink size={8}/></a></div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{color:CL.txtDim,fontSize:10}}>User</span><span style={{fontFamily:"monospace",fontSize:10,color:site.user==="admin"?CL.red:CL.txt,fontWeight:site.user==="admin"?700:400}}>{site.user}{site.user==="admin"?" ⚠":""}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0"}}><span style={{color:CL.txtDim,fontSize:10}}>Password</span><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontFamily:"monospace",fontSize:10,color:CL.txt}}>{showPass?"Xk9#mP2$":"••••••••"}</span><button onClick={()=>setShowPass(!showPass)} style={{background:"none",border:"none",cursor:"pointer",padding:1}}>{showPass?<EyeOff size={10} style={{color:CL.txtDim}}/>:<Eye size={10} style={{color:CL.txtDim}}/>}</button></div></div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {[{l:"Open WP Admin",i:ExternalLink,c:CL.blue},{l:"View Live Site",i:Globe,c:CL.green},{l:"Update All Plugins",i:Plug,c:CL.amber},{l:"Rotate Credentials",i:Lock,c:CL.purple},{l:"Security Hardening",i:Shield,c:CL.blue}].map(({l,i:I,c},k)=>(
                    <button key={k} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"6px 10px",borderRadius:6,background:`${c}08`,border:`1px solid ${c}20`,color:c,cursor:"pointer",fontSize:10,fontWeight:500}}><I size={11}/>{l}</button>
                  ))}
                  <div style={{height:1,background:CL.border}}/>
                  <button style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"6px 10px",borderRadius:6,background:CL.redBg,border:`1px solid ${CL.redBdr}`,color:CL.red,cursor:"pointer",fontSize:10,fontWeight:500}}><XCircle size={11}/> Suspend Site</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Other Sections ───────────────────────────────────
function ChangelogSection(){
  const rows=[["API endpoint naming","Mixed /checkout vs /purchase","Normalized: /purchase (paid), /enable (free)"],["Plugin licensing","Yoast SEO Premium — not GPL","Free wordpress-seo in Golden Image"],["WooCommerce Points","Listed as GPL — it's PAID","Replaced with myCred (free)"],["Failure handling","Retry mentioned, not defined","Full state machine + idempotency + rollback"],["Plugin policy","Contradicted Week 3 policy","All plugins verified: free, no license required"]];
  return(
    <div style={{flex:1,overflowY:"auto",padding:"22px 24px",background:CL.bg}}>
      <h2 style={{fontSize:20,fontWeight:800,color:CL.txt,fontFamily:CL.display,margin:"0 0 4px"}}>Changelog: v1.0 → v1.1</h2>
      <div style={{padding:"8px 12px",borderRadius:8,background:CL.redBg,border:`1px solid ${CL.redBdr}`,fontSize:12,color:CL.red,marginBottom:14}}>⚠ Do not give v1.0 to Claude Code. This v1.1 document supersedes it entirely.</div>
      <div style={{borderRadius:10,overflow:"hidden",border:`1px solid ${CL.border}`}}>
        <div style={{display:"grid",gridTemplateColumns:"180px 1fr 1fr",background:CL.sidebar,borderBottom:`1px solid ${CL.border}`}}>{["Issue","v1.0 (wrong)","v1.1 (fixed)"].map((h,i)=><div key={i} style={{padding:"7px 12px",fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:CL.txtDim,fontFamily:"monospace"}}>{h}</div>)}</div>
        {rows.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"180px 1fr 1fr",background:i%2===0?CL.surface:CL.sidebar+"40",borderBottom:i<rows.length-1?`1px solid ${CL.border}`:"none"}}><div style={{padding:"9px 12px",fontWeight:600,color:CL.txt,fontSize:12}}>{r[0]}</div><div style={{padding:"9px 12px",color:CL.red,fontSize:12,borderLeft:`1px solid ${CL.border}`}}>{r[1]}</div><div style={{padding:"9px 12px",color:CL.green,fontSize:12,borderLeft:`1px solid ${CL.border}`}}>{r[2]}</div></div>)}
      </div>
    </div>
  );
}

function FeaturesSection(){
  const [exp,setExp]=useState(null);
  const SPECS=[{name:"Google Reviews Feed",price:0,plugin:"WP Google Review Slider",status:"FREEMIUM",cmd:"wp plugin install wp-google-review-slider --activate",notes:"Inject Place ID from Blueprint."},{name:"Online Booking System",price:0,plugin:"Amelia Lite",status:"FREEMIUM",cmd:"wp plugin install ameliabooking --activate",notes:"Pre-configure with business hours from Blueprint."},{name:"Live Chat Widget",price:29,plugin:"Tidio Live Chat",status:"FREEMIUM",cmd:"wp plugin install tidio-live-chat --activate",notes:"Install on purchase. Placeholder until customer enters key."},{name:"SEO Pro Tools",price:29,plugin:"wordpress-seo (Golden Image)",status:"ALREADY INSTALLED",cmd:"# No install — already active in Golden Image",notes:"Advanced SEO Agent config pass. NEVER use Yoast Premium."},{name:"Loyalty Program",price:49,plugin:"myCred",status:"VERIFIED FREE",cmd:"wp plugin install mycred --activate",notes:"Replaces WooCommerce Points & Rewards (which is PAID)."}];
  const PSC={"VERIFIED FREE":{c:CL.green,bg:CL.greenBg,b:CL.greenBdr},"FREEMIUM":{c:CL.amber,bg:CL.amberBg,b:CL.amberBdr},"ALREADY INSTALLED":{c:CL.blue,bg:CL.blueBg,b:CL.blueBdr}};
  return(
    <div style={{flex:1,overflowY:"auto",padding:"22px 24px",background:CL.bg}}>
      <h2 style={{fontSize:20,fontWeight:800,color:CL.txt,fontFamily:CL.display,margin:"0 0 14px"}}>Features Catalog</h2>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {SPECS.map((f,i)=>{const ps=PSC[f.status]||PSC.FREEMIUM;return(
          <div key={i} style={{background:CL.surface,border:`1px solid ${exp===i?CL.brand:CL.border}`,borderRadius:10,overflow:"hidden"}}>
            <div onClick={()=>setExp(exp===i?null:i)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer"}}>
              <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}><span style={{fontSize:12,fontWeight:700,color:CL.txt}}>{f.name}</span><Bdg label={f.status} color={ps.c} bg={ps.bg} border={ps.b}/><Bdg label={f.price===0?"free":`$${f.price}`} color={f.price===0?CL.green:CL.brand} bg={f.price===0?CL.greenBg:CL.brandBg} border={f.price===0?CL.greenBdr:CL.brandBdr}/></div><span style={{fontSize:10,color:CL.txtMid,fontFamily:"monospace"}}>{f.plugin}</span></div>
              <span style={{fontSize:10,color:CL.txtDim}}>{exp===i?"▲":"▼"}</span>
            </div>
            {exp===i&&<div style={{padding:"0 14px 14px",borderTop:`1px solid ${CL.border}`}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}><div><div style={{fontSize:9,fontWeight:700,color:CL.txtDim,marginBottom:6,letterSpacing:"0.1em",textTransform:"uppercase"}}>Install Command</div><pre style={{margin:0,padding:"8px 10px",background:"#F5F0EA",border:`1px solid ${CL.border}`,borderRadius:6,fontFamily:"monospace",fontSize:10,color:"#3D2B1F",whiteSpace:"pre-wrap"}}>{f.cmd}</pre></div><div><div style={{fontSize:9,fontWeight:700,color:CL.txtDim,marginBottom:6,letterSpacing:"0.1em",textTransform:"uppercase"}}>Notes</div><p style={{fontSize:11,color:CL.txt,lineHeight:1.6,padding:"8px 10px",background:CL.sidebar,borderRadius:6,margin:0}}>{f.notes}</p></div></div></div>}
          </div>
        );})}
      </div>
    </div>
  );
}

function ImplSection(){
  const [done,setDone]=useState(new Set());
  const steps=[{n:1,task:"Read existing api/addons/*",detail:"Document all routes. Map gaps before writing anything."},{n:2,task:"Add Prisma models",detail:"AddonProduct + SiteAddon to schema.prisma"},{n:3,task:"Run migration",detail:"npx prisma migrate dev --name add_addons_v1"},{n:4,task:"Create src/lib/crypto.ts",detail:"encryptAddonSecret + decryptAddonSecret using AES-256-GCM"},{n:5,task:"Seed AddonProduct catalog",detail:"All 11 MVP features + 10 templates in prisma/seed.ts"},{n:6,task:"Normalize api/addons/* routes",detail:"/purchase (paid), /enable (free), /template, /config"},{n:7,task:"Add webhook case",detail:"payment_intent.succeeded in existing /api/billing/webhook"},{n:8,task:"Create addon.agent.ts",detail:"BullMQ worker on addonQueue. Concurrency 3."},{n:9,task:"Enhance plugins.ts",detail:"installPlugin, configurePlugin, rollbackPlugin"},{n:10,task:"Enhance builder.agent.ts",detail:"Auto-install free features (reviews + booking) post-build"},{n:11,task:"Admin panel: Addons tab",detail:"SiteAddon records, status, installAttempts, lastErrorMsg, retry"},{n:12,task:"Customer portal: config UI",detail:"Config cards for NEEDS_CONFIG features with hints, masked secrets"},{n:13,task:"Run test pipeline",detail:"npx ts-node scripts/test-pipeline.ts — verify end-to-end flow"}];
  const toggle=(n)=>setDone(d=>{const s=new Set(d);s.has(n)?s.delete(n):s.add(n);return s;});
  return(
    <div style={{flex:1,overflowY:"auto",padding:"22px 24px",background:CL.bg}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><h2 style={{fontSize:20,fontWeight:800,color:CL.txt,fontFamily:CL.display,margin:"0 0 3px"}}>Implementation Order</h2><p style={{margin:0,fontSize:12,color:CL.txtMid}}>Click to mark complete. Commit after each step.</p></div>
        <div style={{fontSize:11,fontFamily:"monospace",color:CL.txtDim,background:CL.sidebar,padding:"3px 10px",borderRadius:6,border:`1px solid ${CL.border}`}}>{done.size}/{steps.length}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {steps.map(s=>{const d=done.has(s.n);return(
          <div key={s.n} onClick={()=>toggle(s.n)} style={{display:"flex",gap:10,padding:"10px 14px",background:d?CL.greenBg:CL.surface,border:`1px solid ${d?CL.greenBdr:CL.border}`,borderRadius:8,cursor:"pointer",transition:"all .15s"}}>
            <div style={{flexShrink:0,width:22,height:22,borderRadius:"50%",border:`1.5px solid ${d?CL.green:CL.border}`,background:d?CL.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,fontFamily:"monospace",color:d?"#fff":CL.txtDim}}>{d?"✓":s.n}</div>
            <div><p style={{margin:"0 0 2px",fontSize:11,fontWeight:700,color:d?CL.green:CL.txt}}>{s.task}</p><p style={{margin:0,fontSize:10,color:CL.txtMid,lineHeight:1.5}}>{s.detail}</p></div>
          </div>
        );})}
      </div>
    </div>
  );
}

// ── Admin Shell ────────────────────────────────────────────
const ADMIN_NAV=[{id:"dashboard",label:"Dashboard",icon:Home,badge:null},{id:"sites",label:"Client Sites",icon:Globe,badge:"10"},{id:"changelog",label:"Changelog",icon:List,badge:null},{id:"features",label:"Features",icon:Package,badge:null},{id:"impl",label:"Impl Order",icon:Cpu,badge:null}];

function AdminPanel({onGoToStudio}){
  const [section,setSection]=useState("dashboard");
  const SECS={dashboard:<OperatorDashboard/>,sites:<ClientSitesSection/>,changelog:<ChangelogSection/>,features:<FeaturesSection/>,impl:<ImplSection/>};
  return(
    <div style={{minHeight:"100vh",background:CL.bg,color:CL.txt,display:"flex",flexDirection:"column",fontFamily:CL.sans}}>
      <style>{FONTS}{ANIM}</style>
      <div style={{background:CL.surface,borderBottom:`1px solid ${CL.border}`,padding:"0 18px",display:"flex",alignItems:"center",height:50,gap:12,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:26,height:26,borderRadius:7,background:CL.brand,display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={12} style={{color:"#fff"}}/></div><span style={{fontSize:14,fontWeight:800,color:CL.txt,fontFamily:CL.display}}>Xusmo</span><span style={{color:CL.border}}>/</span><span style={{fontSize:11,color:CL.txtDim,fontFamily:"monospace"}}>admin</span></div>
        <div style={{display:"flex",gap:6,marginLeft:"auto",alignItems:"center"}}>
          <Bdg label="v1.1" color={CL.green} bg={CL.greenBg} border={CL.greenBdr}/>
          <button onClick={onGoToStudio} style={{marginLeft:6,padding:"4px 11px",borderRadius:7,border:`1px solid ${CL.border}`,background:CL.sidebar,color:CL.txtMid,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><ArrowLeft size={11}/> Studio</button>
        </div>
      </div>
      <div style={{display:"flex",flex:1,minHeight:0}}>
        <div style={{width:188,background:CL.sidebar,borderRight:`1px solid ${CL.border}`,padding:"10px 0",flexShrink:0}}>
          {ADMIN_NAV.map(item=>{const I=item.icon;const a=section===item.id;return(
            <button key={item.id} onClick={()=>setSection(item.id)} style={{width:"100%",textAlign:"left",background:a?CL.brandBg:"transparent",border:"none",borderLeft:`3px solid ${a?CL.brand:"transparent"}`,cursor:"pointer",padding:"8px 12px",display:"flex",alignItems:"center",gap:7}}>
              <I size={12} style={{color:a?CL.brand:CL.txtDim}}/><span style={{fontSize:11,fontWeight:a?700:400,color:a?CL.txt:CL.txtMid,flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:8,fontFamily:"monospace",color:a?CL.brand:CL.txtDim}}>{item.badge}</span>}
            </button>
          );})}
        </div>
        <div style={{flex:1,minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column"}}>{SECS[section]}</div>
      </div>
    </div>
  );
}

// ── Studio Components ──────────────────────────────────────
function TemplateCard({tmpl,isActive,onSelect,onPreview}){
  const [hov,setHov]=useState(false);
  const ip=tmpl.price>0;
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSelect(tmpl)} style={{position:"relative",borderRadius:12,overflow:"hidden",border:`2px solid ${isActive?CL.brand:CL.border}`,cursor:"pointer",transition:"all .2s",boxShadow:isActive?`0 0 0 3px ${CL.brandBg}`:"none"}}>
      <div style={{height:120,position:"relative",background:tmpl.preview.bg}}>
        <div style={{position:"absolute",inset:0,padding:7,display:"flex",flexDirection:"column",gap:5,transform:"scale(0.85)",transformOrigin:"top left"}}>
          <div style={{height:14,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 7px",background:tmpl.preview.card,border:`1px solid ${tmpl.preview.accent}22`}}><div style={{height:5,width:32,borderRadius:3,background:tmpl.preview.accent}}/><div style={{display:"flex",gap:3}}>{[1,2,3].map(i=><div key={i} style={{height:3,width:16,borderRadius:2,background:`${tmpl.textMuted}55`}}/>)}</div></div>
          <div style={{flex:1,borderRadius:3,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,background:`${tmpl.preview.accent}15`,border:`1px solid ${tmpl.preview.accent}25`}}><div style={{height:7,width:80,borderRadius:3,background:tmpl.preview.accent}}/><div style={{height:3,width:100,borderRadius:2,background:`${tmpl.textMuted}55`}}/><div style={{height:16,width:60,borderRadius:3,background:tmpl.preview.accent}}/></div>
          <div style={{display:"flex",gap:4,height:28}}>{[1,2,3].map(i=><div key={i} style={{flex:1,borderRadius:3,background:tmpl.preview.card,border:`1px solid ${tmpl.preview.accent}20`}}/>)}</div>
        </div>
        {hov&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <button onClick={e=>{e.stopPropagation();onPreview(tmpl);}} style={{padding:"5px 10px",borderRadius:7,background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",fontSize:10,fontWeight:600,cursor:"pointer",backdropFilter:"blur(4px)"}}><Eye size={10} style={{display:"inline",marginRight:3}}/> Preview</button>
          <button onClick={e=>{e.stopPropagation();onSelect(tmpl);}} style={{padding:"5px 10px",borderRadius:7,background:tmpl.preview.accent,border:"none",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}><Check size={10} style={{display:"inline",marginRight:3}}/> Use This</button>
        </div>}
        <div style={{position:"absolute",top:7,left:7}}>{ip?<span style={{padding:"2px 7px",borderRadius:3,fontSize:9,fontWeight:700,background:"#b45309",color:"#fef3c7",display:"inline-flex",alignItems:"center",gap:2}}><Crown size={7}/>Premium</span>:<span style={{padding:"2px 7px",borderRadius:3,fontSize:9,fontWeight:700,background:CL.greenBg,color:CL.green,border:`1px solid ${CL.greenBdr}`}}>Free</span>}</div>
        {ip&&<div style={{position:"absolute",top:7,right:7,padding:"2px 7px",borderRadius:3,fontSize:9,fontWeight:700,background:"#b45309",color:"#fef3c7"}}>${tmpl.price}</div>}
        {isActive&&<div style={{position:"absolute",bottom:7,right:7}}><CheckCircle size={16} style={{color:CL.brand}}/></div>}
      </div>
      <div style={{padding:"9px 11px",background:CL.surface,borderTop:`1px solid ${CL.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:1}}><span style={{fontSize:12,fontWeight:700,color:CL.txt}}>{tmpl.name}</span>{ip&&<span style={{fontSize:9,fontWeight:700,color:"#b45309"}}>${tmpl.price} one-time</span>}</div>
        <p style={{fontSize:10,color:CL.txtDim,margin:"0 0 5px",lineHeight:1.4}}>{tmpl.description}</p>
        <div style={{display:"flex",gap:3}}>{tmpl.tags.slice(0,2).map(t=><span key={t} style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:CL.sidebar,color:CL.txtMid,border:`1px solid ${CL.border}`}}>{t}</span>)}</div>
      </div>
    </div>
  );
}

function FeatureCard({feature,isEnabled,onToggle}){
  const [exp,setExp]=useState(false);
  const I=feature.icon;
  return(
    <div style={{borderRadius:9,border:`1px solid ${isEnabled?CL.brand:CL.border}`,background:isEnabled?CL.brandBg:CL.surface,overflow:"hidden"}}>
      <div style={{padding:"11px 12px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:9}}>
          <div style={{width:34,height:34,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:isEnabled?CL.brandBg:CL.sidebar}}><I size={14} style={{color:isEnabled?CL.brand:CL.txtDim}}/></div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><span style={{fontSize:12,fontWeight:700,color:CL.txt}}>{feature.name}</span>{feature.popular&&<span style={{fontSize:8,padding:"1px 5px",borderRadius:3,background:CL.amberBg,color:CL.amber,fontWeight:700,border:`1px solid ${CL.amberBdr}`}}>Popular</span>}</div>
            <p style={{fontSize:10,color:CL.txtDim,margin:0,lineHeight:1.4}}>{feature.desc}</p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:9}}>
          <div>{feature.price===0?<span style={{fontSize:12,fontWeight:700,color:CL.green}}>Free</span>:<div><span style={{fontSize:12,fontWeight:700,color:CL.txt}}>${feature.price}</span><span style={{fontSize:10,color:CL.txtDim}}>/{feature.period}</span></div>}</div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <button onClick={()=>setExp(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",padding:2,color:CL.txtDim}}><Info size={12}/></button>
            <button onClick={()=>onToggle(feature.id)} style={{position:"relative",width:40,height:22,borderRadius:11,background:isEnabled?CL.brand:CL.hover,border:"none",cursor:"pointer",transition:"background .2s"}}><div style={{position:"absolute",top:3,left:isEnabled?21:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/></button>
          </div>
        </div>
      </div>
      {exp&&<div style={{padding:"0 12px 10px",borderTop:`1px solid ${CL.border}`}}><div style={{paddingTop:8}}>{feature.includes.map((inc,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:CL.txtMid,marginBottom:3}}><CheckCircle size={9} style={{color:CL.green}}/>{inc}</div>)}</div></div>}
    </div>
  );
}

function SitePreview({data,tmpl}){
  const color=tmpl.primaryColor;
  return(
    <div style={{background:tmpl.bg,color:tmpl.textPrimary,fontFamily:`${tmpl.fontBody},system-ui,sans-serif`,minHeight:"100%"}}>
      <div style={{background:tmpl.bg.startsWith("#0")||tmpl.bg.startsWith("#1")?"rgba(0,0,0,0.7)":"rgba(255,255,255,0.9)",borderBottom:`1px solid ${tmpl.border}`,backdropFilter:"blur(8px)",position:"sticky",top:0,zIndex:50,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontFamily:`${tmpl.fontDisplay},sans-serif`,fontWeight:700,color:tmpl.textPrimary,fontSize:16}}>{data.businessName}</div>
        <div style={{display:"flex",gap:18,fontSize:12,color:tmpl.textMuted}}>{(data.pages||["Home","Services","About","Contact"]).map(p=><span key={p} style={{cursor:"pointer"}}>{p}</span>)}</div>
        <button style={{background:color,padding:"7px 14px",borderRadius:7,color:"#fff",fontSize:12,fontWeight:600,border:"none",cursor:"pointer"}}>Get a Quote</button>
      </div>
      <div style={{background:`linear-gradient(135deg,${tmpl.bg} 0%,${color}18 100%)`,padding:"56px 24px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{background:`${color}15`,border:`1px solid ${color}35`,color:tmpl.textMuted,display:"inline-block",marginBottom:14,padding:"5px 14px",borderRadius:20,fontSize:12}}>{data.licenses} · {data.yearsInBusiness}+ Years</div>
          <h1 style={{fontFamily:`${tmpl.fontDisplay},sans-serif`,fontWeight:800,color:tmpl.textPrimary,fontSize:36,lineHeight:1.1,margin:"0 0 14px"}}>{data.tagline}</h1>
          <p style={{color:tmpl.textMuted,fontSize:14,margin:"0 0 22px",lineHeight:1.7}}>{data.about}</p>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button style={{background:color,padding:"12px 26px",borderRadius:9,fontWeight:700,color:"#fff",fontSize:14,border:"none",cursor:"pointer"}}>Get a Free Quote</button>
            <button style={{border:`1px solid ${tmpl.border}`,color:tmpl.textMuted,padding:"12px 26px",borderRadius:9,fontWeight:600,fontSize:14,background:"transparent",cursor:"pointer"}}>Call {data.phone}</button>
          </div>
        </div>
      </div>
      <div style={{background:tmpl.surface,borderTop:`1px solid ${tmpl.border}`,borderBottom:`1px solid ${tmpl.border}`,padding:"10px 20px"}}><div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:18,fontSize:12,color:tmpl.textMuted}}>{["24/7 Emergency",data.licenses,`${data.yearsInBusiness}+ Years`,`Serving ${data.city}`].map((t,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:5}}><Shield size={11} style={{color}}/>{t}</span>)}</div></div>
      <div style={{padding:"36px 20px",maxWidth:860,margin:"0 auto"}}>
        <div style={{fontFamily:`${tmpl.fontDisplay},sans-serif`,color:tmpl.textPrimary,fontSize:20,fontWeight:700,textAlign:"center",marginBottom:6}}>Our Services</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginTop:20}}>{(data.services||[]).map((s,i)=><div key={i} style={{background:tmpl.surface,border:`1px solid ${tmpl.border}`,padding:16,borderRadius:10}}><div style={{background:`${color}18`,width:28,height:28,borderRadius:7,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={12} style={{color}}/></div><div style={{fontFamily:`${tmpl.fontDisplay},sans-serif`,color:tmpl.textPrimary,fontWeight:700,marginBottom:3,fontSize:12}}>{s.name}</div><div style={{color:tmpl.textMuted,fontSize:11,lineHeight:1.5}}>{s.desc}</div></div>)}</div>
      </div>
      <div style={{background:tmpl.surface,borderTop:`1px solid ${tmpl.border}`,padding:"30px 20px"}}>
        <div style={{fontFamily:`${tmpl.fontDisplay},sans-serif`,color:tmpl.textPrimary,fontSize:18,fontWeight:700,textAlign:"center",marginBottom:20}}>What Our Customers Say</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,maxWidth:700,margin:"0 auto"}}>{(data.testimonials||[]).map((t,i)=><div key={i} style={{background:tmpl.bg,border:`1px solid ${tmpl.border}`,padding:16,borderRadius:10}}><div style={{display:"flex",gap:2,marginBottom:9}}>{[...Array(5)].map((_,j)=><Star key={j} size={11} style={{color:"#f59e0b",fill:"#f59e0b"}}/>)}</div><p style={{color:tmpl.textMuted,fontSize:12,lineHeight:1.6,margin:"0 0 9px"}}>"{t.text}"</p><div style={{color:tmpl.textMuted,opacity:.6,fontSize:10,fontWeight:600}}>— {t.name}</div></div>)}</div>
      </div>
      <div style={{background:tmpl.bg,borderTop:`1px solid ${tmpl.border}`,padding:"22px 20px"}}><div style={{maxWidth:700,margin:"0 auto",display:"flex",justifyContent:"space-between",gap:14}}><div><div style={{fontFamily:`${tmpl.fontDisplay},sans-serif`,color:tmpl.textPrimary,fontWeight:700,fontSize:15,marginBottom:3}}>{data.businessName}</div><div style={{color:tmpl.textMuted,fontSize:11}}>{data.address}</div></div><div style={{display:"flex",flexDirection:"column",gap:4,color:tmpl.textMuted}}><div style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}><Phone size={10}/>{data.phone}</div><div style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}><Mail size={10}/>{data.email}</div><div style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}><Clock size={10}/>{data.hours}</div></div></div></div>
    </div>
  );
}

// ── Studio Screens ─────────────────────────────────────────
function Landing({onStart,onAdmin}){
  return(
    <div style={{minHeight:"100vh",background:CL.bg,color:CL.txt,position:"relative",overflow:"hidden",fontFamily:CL.sans}}>
      <style>{FONTS}{ANIM}</style>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 25% 20%, rgba(204,107,46,0.12) 0%, transparent 50%), radial-gradient(ellipse at 75% 80%, rgba(204,107,46,0.06) 0%, transparent 50%)"}}/>
      <nav style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:34,height:34,borderRadius:9,background:CL.brand,display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={16} style={{color:"#fff"}}/></div><span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:19,color:CL.txt}}>Xusmo</span></div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={onStart} style={{fontSize:13,fontWeight:600,color:CL.brand,background:"none",border:"none",cursor:"pointer"}}>Build My Site →</button>
          <button onClick={onAdmin} style={{fontSize:11,color:CL.txtDim,border:`1px solid ${CL.border}`,padding:"5px 11px",borderRadius:7,background:CL.sidebar,cursor:"pointer"}}>Admin ⚙</button>
        </div>
      </nav>
      <div style={{position:"relative",zIndex:10,maxWidth:860,margin:"0 auto",padding:"64px 24px 72px",textAlign:"center"}}>
        <div className="fade-up" style={{display:"inline-flex",alignItems:"center",gap:7,marginBottom:20,padding:"5px 14px",borderRadius:20,fontSize:11,fontWeight:600,background:CL.brandBg,border:`1px solid ${CL.brandBdr}`,color:CL.brand}}><Sparkles size={12}/> 10 Templates · Feature Marketplace · Visual Studio</div>
        <h1 className="fade-up" style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(36px,6vw,64px)",fontWeight:800,lineHeight:1.05,margin:"0 0 18px",color:CL.txt,animationDelay:".1s"}}>Build. Customize.<br/><span style={{color:CL.brand}}>Go Live.</span></h1>
        <p className="fade-up" style={{fontSize:17,color:CL.txtMid,maxWidth:500,margin:"0 auto 36px",lineHeight:1.7,fontWeight:300,animationDelay:".2s"}}>AI builds your site in minutes. Pick a template, add features, edit everything visually.</p>
        <div className="fade-up" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,marginBottom:48,animationDelay:".3s"}}>
          <button onClick={onStart} className="glow-brand" style={{background:CL.brand,color:"#fff",padding:"14px 36px",borderRadius:13,fontWeight:800,fontSize:17,border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:9}}>Build My Site Free <ArrowRight size={20}/></button>
          <span style={{fontSize:12,color:CL.txtDim}}>Free to build · Templates from $0</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,maxWidth:640,margin:"0 auto"}}>
          {[{n:"10",t:"Templates",d:"Free & Premium"},{n:"12+",t:"Features",d:"Add what you need"},{n:"30",t:"Industries",d:"Smart defaults"},{n:"~5min",t:"Build time",d:"AI-powered"}].map((s,i)=>(
            <div key={i} className="fade-up" style={{padding:"14px 10px",borderRadius:14,background:CL.surface,border:`1px solid ${CL.border}`,textAlign:"center",animationDelay:`${.4+i*.07}s`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,marginBottom:3,color:CL.brand}}>{s.n}</div>
              <div style={{color:CL.txt,fontSize:12,fontWeight:600}}>{s.t}</div>
              <div style={{color:CL.txtDim,fontSize:10,marginTop:2}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Intake({onSubmit,onBack}){
  const [name,setName]=useState("");
  const [trade,setTrade]=useState("Plumbing");
  const [city,setCity]=useState("Toronto");
  const valid=name.trim().length>0&&city.trim().length>0;
  return(
    <div style={{minHeight:"100vh",background:CL.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",fontFamily:CL.sans}}>
      <style>{FONTS}{ANIM}</style>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 30%, rgba(204,107,46,0.08) 0%, transparent 60%)"}}/>
      <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:440}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:5,color:CL.txtDim,fontSize:12,marginBottom:28,background:"none",border:"none",cursor:"pointer"}}><ArrowLeft size={15}/> Back</button>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:28}}><div style={{width:30,height:30,borderRadius:7,background:CL.brand,display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={13} style={{color:"#fff"}}/></div><span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:CL.txt}}>Xusmo</span></div>
        <h2 style={{fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,margin:"0 0 7px",color:CL.txt}}>Three quick details</h2>
        <p style={{color:CL.txtMid,marginBottom:28,fontSize:12}}>Then AI takes over and builds your site.</p>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[{l:"Business Name *",v:name,s:setName,p:"e.g. Fast Pipes Toronto",t:"input"},{l:"Trade / Industry",v:trade,s:setTrade,t:"select"},{l:"City / Service Area *",v:city,s:setCity,p:"e.g. Toronto",t:"input"}].map((f,i)=>(
            <div key={i}>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:CL.txtDim,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{f.l}</label>
              {f.t==="select"
                ?<select value={f.v} onChange={e=>f.s(e.target.value)} style={{width:"100%",padding:"11px 13px",borderRadius:9,background:CL.surface,border:`1px solid ${CL.border}`,outline:"none",fontSize:12,color:CL.txt,cursor:"pointer"}}>{TRADES.map(t=><option key={t}>{t}</option>)}</select>
                :<input value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.p||""} autoFocus={i===0} style={{width:"100%",padding:"11px 13px",borderRadius:9,background:CL.surface,border:`1px solid ${CL.border}`,outline:"none",fontSize:12,color:CL.txt,boxSizing:"border-box"}}/>
              }
            </div>
          ))}
        </div>
        <button onClick={()=>valid&&onSubmit({name:name.trim(),trade,city:city.trim()})} disabled={!valid} style={{marginTop:24,width:"100%",padding:"13px",borderRadius:11,fontWeight:800,fontSize:14,border:"none",cursor:valid?"pointer":"not-allowed",background:valid?CL.brand:CL.hover,color:valid?"#fff":CL.txtDim,display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .2s"}}>
          Start AI Interview <ArrowRight size={17}/>
        </button>
      </div>
    </div>
  );
}

function Interview({quickData,onComplete,onBack}){
  const [messages,setMessages]=useState([]);
  const [apiHistory,setApiHistory]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [started,setStarted]=useState(false);
  const [progress,setProgress]=useState(0);
  const endRef=useRef(null);
  const inputRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);
  useEffect(()=>{if(!started){setStarted(true);callAPI([{role:"user",content:`Hi! Building a website for my ${quickData.trade} business "${quickData.name}" in ${quickData.city}.`}],true);}},[]);
  const callAPI=async(msgs,isInit=false)=>{
    if(!isInit) setMessages(p=>[...p,{role:"user",text:msgs[msgs.length-1].content}]);
    setLoading(true);setApiHistory(msgs);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:buildSP(quickData),messages:msgs})});
      const data=await res.json();
      const full=data.content?.map(c=>c.text||"").join("\n")||"Connection issue — try again?";
      if(full.includes("|||SITE_DATA|||\n")){
        const display=full.split("|||SITE_DATA|||\n")[0].trim();
        const json=full.split("|||SITE_DATA|||\n")[1].split("\n|||END_DATA|||")[0].trim();
        setMessages(p=>[...p,{role:"assistant",text:display}]);setProgress(100);
        try{const parsed=JSON.parse(json);setTimeout(()=>onComplete(parsed),1800);}catch(e){}
      }else{setMessages(p=>[...p,{role:"assistant",text:full}]);setApiHistory(p=>[...p,{role:"assistant",content:full}]);setProgress(p=>Math.min(p+22,90));}
    }catch{setMessages(p=>[...p,{role:"assistant",text:"Connection issue — try again?"}]);}
    setLoading(false);setTimeout(()=>inputRef.current?.focus(),100);
  };
  const send=()=>{if(!input.trim()||loading)return;const t=input.trim();setInput("");callAPI([...apiHistory,{role:"user",content:t}]);};
  return(
    <div style={{minHeight:"100vh",background:CL.bg,color:CL.txt,display:"flex",flexDirection:"column",fontFamily:CL.sans}}>
      <style>{FONTS}{ANIM}</style>
      <div style={{background:CL.surface,borderBottom:`1px solid ${CL.border}`,padding:"12px 20px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{color:CL.txtDim,background:"none",border:"none",cursor:"pointer"}}><ArrowLeft size={20}/></button>
        <div style={{width:36,height:36,borderRadius:"50%",background:CL.brand,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Zap size={14} style={{color:"#fff"}}/></div>
        <div style={{flex:1}}><div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:13,color:CL.txt}}>AI Consultant</div><div style={{fontSize:11,color:CL.txtDim}}>Designing <span style={{color:CL.brand}}>{quickData.name}</span></div></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:"50%",background:CL.green}}/><span style={{fontSize:11,color:CL.txtDim}}>Live</span></div>
      </div>
      <div style={{height:3,background:CL.hover}}><div style={{height:"100%",background:`linear-gradient(to right, ${CL.brandHov}, ${CL.brand})`,transition:"width .7s",width:`${progress}%`}}/></div>
      <div style={{flex:1,overflowY:"auto",padding:"24px 16px",display:"flex",flexDirection:"column",gap:16}}>
        {messages.length===0&&!loading&&<div style={{textAlign:"center",color:CL.txtDim,fontSize:13,padding:"48px 0"}}><div style={{width:48,height:48,borderRadius:"50%",background:CL.brandBg,border:`1px solid ${CL.brandBdr}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Zap size={20} style={{color:CL.brand}}/></div>Connecting...</div>}
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:10,justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            {m.role==="assistant"&&<div style={{width:32,height:32,borderRadius:"50%",background:CL.brand,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}><Zap size={12} style={{color:"#fff"}}/></div>}
            <div style={{maxWidth:480,padding:"12px 16px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap",background:m.role==="user"?CL.brand:CL.surface,color:m.role==="user"?"#fff":CL.txt,border:m.role==="user"?"none":`1px solid ${CL.border}`}}>{m.text}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:10}}><div style={{width:32,height:32,borderRadius:"50%",background:CL.brand,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Zap size={12} style={{color:"#fff"}}/></div><div style={{padding:"12px 20px",borderRadius:"16px 16px 16px 4px",background:CL.surface,border:`1px solid ${CL.border}`}}><div className="dot-pulse" style={{display:"flex",gap:6}}><span style={{width:8,height:8,background:CL.txtDim,borderRadius:"50%",display:"inline-block"}}/><span style={{width:8,height:8,background:CL.txtDim,borderRadius:"50%",display:"inline-block"}}/><span style={{width:8,height:8,background:CL.txtDim,borderRadius:"50%",display:"inline-block"}}/></div></div></div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"16px",borderTop:`1px solid ${CL.border}`,background:CL.surface}}>
        <div style={{display:"flex",gap:8,maxWidth:640,margin:"0 auto"}}>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type your answer..." disabled={loading} style={{flex:1,padding:"12px 16px",borderRadius:12,background:CL.bg,border:`1px solid ${CL.border}`,outline:"none",fontSize:13,color:CL.txt}}/>
          <button onClick={send} disabled={!input.trim()||loading} style={{padding:"12px 16px",borderRadius:12,background:input.trim()&&!loading?CL.brand:CL.hover,border:"none",cursor:input.trim()&&!loading?"pointer":"not-allowed",display:"flex",alignItems:"center",transition:"background .15s"}}><Send size={17} style={{color:input.trim()&&!loading?"#fff":CL.txtDim}}/></button>
        </div>
      </div>
    </div>
  );
}

function Building({siteData,onDone}){
  const [step,setStep]=useState(0);
  const steps=["Cloning WordPress environment","Applying theme & plugins","Generating page content","Injecting SEO & business details","Configuring forms & security","Quality check complete"];
  useEffect(()=>{
    const timers=steps.map((_,i)=>setTimeout(()=>setStep(i+1),(i+1)*900));
    const done=setTimeout(()=>onDone({siteUrl:`https://demo.staging.xusmo.io`,adminUrl:`https://demo.staging.xusmo.io/wp-admin`,username:"owner",password:"sf_demo_pw"}),steps.length*900+500);
    return()=>{timers.forEach(clearTimeout);clearTimeout(done);};
  },[]);
  return(
    <div style={{minHeight:"100vh",background:CL.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:CL.sans}}>
      <style>{FONTS}{ANIM}</style>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{position:"relative",width:80,height:80,margin:"0 auto 24px"}}>
            <div style={{position:"absolute",inset:0,borderRadius:16,background:CL.brandBg,border:`1px solid ${CL.brandBdr}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={32} style={{color:CL.brand}}/></div>
            <svg style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}} width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke={CL.border} strokeWidth="3"/>
              <circle cx="40" cy="40" r="36" fill="none" stroke={CL.brand} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${2*Math.PI*36}`} strokeDashoffset={`${2*Math.PI*36*(1-step/steps.length)}`} style={{transition:"stroke-dashoffset .9s ease"}}/>
            </svg>
          </div>
          <h2 style={{fontFamily:"Syne,sans-serif",fontSize:24,fontWeight:800,margin:"0 0 4px",color:CL.txt}}>Building your site...</h2>
          <p style={{color:CL.txtDim,fontSize:13,margin:0}}>{siteData?.businessName}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,background:step>i?CL.surface:CL.bg,border:`1px solid ${step>i?CL.border:"transparent"}`,opacity:step>i?1:0.4,transition:"all .5s"}}>
              <div style={{flexShrink:0}}>
                {step>i?<CheckCircle size={16} style={{color:CL.green}}/>:step===i?<div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${CL.brand}`,borderTopColor:"transparent"}} className="spin"/>:<div style={{width:16,height:16,borderRadius:"50%",border:`1.5px solid ${CL.border}`}}/>}
              </div>
              <span style={{fontSize:13,color:step>i?CL.txt:CL.txtDim}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Studio({siteData,credentials,onPublish,onAdmin}){
  const [activeTemplate,setActiveTemplate]=useState(STUDIO_TEMPLATES[0]);
  const [enabledFeatures,setEnabledFeatures]=useState(new Set(["reviews"]));
  const [activePanel,setActivePanel]=useState("templates");
  const [viewport,setViewport]=useState("desktop");
  const [templateFilter,setTemplateFilter]=useState("all");
  const [featureFilter,setFeatureFilter]=useState("all");
  const [previewTemplate,setPreviewTemplate]=useState(null);
  const [cartOpen,setCartOpen]=useState(false);
  const [copied,setCopied]=useState(null);
  const [seoData,setSeoData]=useState({title:siteData.seoTitle||"",desc:siteData.seoDescription||"",keywords:siteData.seoKeywords||""});
  const [data,setData]=useState(siteData);
  const displayTemplate=previewTemplate||activeTemplate;
  const copyText=(v,k)=>{navigator.clipboard?.writeText(v);setCopied(k);setTimeout(()=>setCopied(null),2000);};
  const featureMonthlyCost=[...enabledFeatures].reduce((s,fid)=>{const f=STUDIO_FEATURES.find(f=>f.id===fid);return s+(f&&f.period==="mo"?f.price:0);},0);
  const featureOneTimeCost=[...enabledFeatures].reduce((s,fid)=>{const f=STUDIO_FEATURES.find(f=>f.id===fid);return s+(f&&f.period==="one-time"?f.price:0);},0);
  const monthlyTotal=BASE_PRICE+featureMonthlyCost;
  const totalToday=(activeTemplate.price||0)+featureOneTimeCost;
  const toggleFeature=(fid)=>setEnabledFeatures(p=>{const n=new Set(p);n.has(fid)?n.delete(fid):n.add(fid);return n;});
  const filteredTemplates=templateFilter==="all"?STUDIO_TEMPLATES:templateFilter==="free"?STUDIO_TEMPLATES.filter(t=>t.price===0):templateFilter==="premium"?STUDIO_TEMPLATES.filter(t=>t.price>0):STUDIO_TEMPLATES.filter(t=>t.category===templateFilter);
  const filteredFeatures=featureFilter==="all"?STUDIO_FEATURES:STUDIO_FEATURES.filter(f=>f.category===featureFilter);
  const vpWidth={desktop:"100%",tablet:"768px",mobile:"390px"};
  const panels=[{id:"templates",icon:<Layout size={14}/>,label:"Templates"},{id:"features",icon:<Package size={14}/>,label:"Features"},{id:"design",icon:<Palette size={14}/>,label:"Design"},{id:"seo",icon:<Search size={14}/>,label:"SEO"},{id:"content",icon:<FileText size={14}/>,label:"Content"}];
  return(
    <div style={{height:"100vh",background:CL.bg,color:CL.txt,display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:CL.sans}}>
      <style>{FONTS}{ANIM}</style>
      <div style={{background:CL.surface,borderBottom:`1px solid ${CL.border}`,padding:"0 14px",height:48,display:"flex",alignItems:"center",gap:10,flexShrink:0,zIndex:30}}>
        <div style={{display:"flex",alignItems:"center",gap:7,paddingRight:10,borderRight:`1px solid ${CL.border}`,flexShrink:0}}>
          <div style={{width:22,height:22,borderRadius:5,background:CL.brand,display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={10} style={{color:"#fff"}}/></div>
          <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:CL.txt}}>Xusmo</span>
          <span style={{color:CL.txtDim,fontSize:11}}>/</span>
          <span style={{fontSize:11,color:CL.txtMid,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{data.businessName}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:2,padding:"3px 5px",borderRadius:7,background:CL.sidebar,border:`1px solid ${CL.border}`}}>
          {[["desktop",<Monitor size={11}/>],["tablet",<Tablet size={11}/>],["mobile",<Smartphone size={11}/>]].map(([v,icon])=>(
            <button key={v} onClick={()=>setViewport(v)} style={{padding:"4px 6px",borderRadius:5,border:"none",cursor:"pointer",background:viewport===v?CL.surface:CL.sidebar,color:viewport===v?CL.brand:CL.txtDim,boxShadow:viewport===v?"0 1px 3px rgba(0,0,0,0.08)":"none",transition:"all .15s"}}>{icon}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
          <button onClick={()=>setCartOpen(v=>!v)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:7,border:`1px solid ${cartOpen?CL.brand:CL.border}`,background:cartOpen?CL.brandBg:CL.sidebar,color:cartOpen?CL.brand:CL.txt,cursor:"pointer",fontSize:11,fontWeight:600,transition:"all .15s"}}>
            <ShoppingCart size={12} style={{color:cartOpen?CL.brand:CL.txtDim}}/>${monthlyTotal.toFixed(2)}/mo
            {enabledFeatures.size>0&&<span style={{padding:"1px 5px",borderRadius:4,background:CL.brand,color:"#fff",fontSize:9,fontWeight:700,marginLeft:2}}>{enabledFeatures.size}</span>}
          </button>
          <button onClick={onAdmin} style={{fontSize:10,color:CL.txtDim,border:`1px solid ${CL.border}`,padding:"4px 9px",borderRadius:7,background:CL.sidebar,cursor:"pointer"}}>Admin ⚙</button>
          <button onClick={onPublish} className="glow-brand" style={{padding:"6px 14px",borderRadius:9,fontSize:11,fontWeight:700,background:CL.brand,color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>Publish <ArrowRight size={11}/></button>
        </div>
      </div>
      {cartOpen&&(
        <div style={{position:"absolute",top:52,right:14,zIndex:50,width:290,borderRadius:14,background:CL.surface,border:`1px solid ${CL.borderHi}`,boxShadow:"0 12px 40px rgba(0,0,0,0.15)",overflow:"hidden"}}>
          <div style={{padding:"11px 14px",borderBottom:`1px solid ${CL.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:CL.txt}}>Your Plan</span>
            <button onClick={()=>setCartOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:CL.txtDim}}><X size={13}/></button>
          </div>
          <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:7}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:CL.txtMid}}>Base hosting</span><span style={{color:CL.txt,fontWeight:600}}>${BASE_PRICE}/mo</span></div>
            {activeTemplate.price>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:CL.txtMid}}>{activeTemplate.name} template</span><span style={{color:"#b45309",fontWeight:700}}>${activeTemplate.price} once</span></div>}
            {[...enabledFeatures].map(fid=>{const f=STUDIO_FEATURES.find(f=>f.id===fid);if(!f||f.price===0)return null;return(<div key={fid} style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:CL.txtMid}}>{f.name}</span><span style={{color:CL.blue,fontWeight:600}}>{f.period==="mo"?`$${f.price}/mo`:`$${f.price} once`}</span></div>);})}
            {[...enabledFeatures].some(fid=>STUDIO_FEATURES.find(f=>f.id===fid)?.price===0)&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:CL.txtDim}}>Free features</span><span style={{color:CL.green}}>Included</span></div>}
          </div>
          <div style={{padding:"10px 14px",borderTop:`1px solid ${CL.border}`,display:"flex",flexDirection:"column",gap:5}}>
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:13}}><span style={{color:CL.txt}}>Monthly total</span><span style={{color:CL.brand}}>${monthlyTotal.toFixed(2)}/mo</span></div>
            {totalToday>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:CL.txtDim}}><span>Due today (one-time)</span><span>${totalToday}</span></div>}
          </div>
          <div style={{padding:"0 14px 14px"}}>
            <button onClick={()=>{setCartOpen(false);onPublish();}} style={{width:"100%",padding:"10px",borderRadius:10,background:CL.brand,color:"#fff",fontWeight:700,fontSize:12,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <Globe size={12}/> Publish & Pay — ${monthlyTotal.toFixed(2)}/mo
            </button>
          </div>
        </div>
      )}
      <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
        <div style={{width:270,display:"flex",flexDirection:"column",borderRight:`1px solid ${CL.border}`,flexShrink:0,background:CL.sidebar}}>
          <div style={{display:"flex",borderBottom:`1px solid ${CL.border}`,background:CL.surface,flexShrink:0}}>
            {panels.map(p=>(
              <button key={p.id} onClick={()=>setActivePanel(p.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"9px 4px",gap:3,fontSize:9,border:"none",cursor:"pointer",borderBottom:`2px solid ${activePanel===p.id?CL.brand:"transparent"}`,background:"transparent",color:activePanel===p.id?CL.brand:CL.txtDim,fontWeight:activePanel===p.id?700:400,transition:"color .15s"}}>
                {p.icon}<span>{p.label}</span>
              </button>
            ))}
          </div>
          {activePanel==="templates"&&(
            <div style={{flex:1,overflowY:"auto"}}>
              <div style={{padding:"8px 10px",borderBottom:`1px solid ${CL.border}`,background:CL.surface}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{["all","free","premium","minimal","warm","bold","bright"].map(f=><button key={f} onClick={()=>setTemplateFilter(f)} style={{padding:"2px 7px",borderRadius:5,fontSize:9,border:`1px solid ${templateFilter===f?CL.brand:CL.border}`,background:templateFilter===f?CL.brandBg:"transparent",color:templateFilter===f?CL.brand:CL.txtDim,cursor:"pointer",fontWeight:templateFilter===f?700:400}}>{f}</button>)}</div>
              </div>
              <div style={{padding:10,display:"flex",flexDirection:"column",gap:10}}>{filteredTemplates.map(tmpl=><TemplateCard key={tmpl.id} tmpl={tmpl} isActive={activeTemplate.id===tmpl.id} onSelect={setActiveTemplate} onPreview={setPreviewTemplate}/>)}</div>
            </div>
          )}
          {activePanel==="features"&&(
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"9px 10px",borderBottom:`1px solid ${CL.border}`,background:CL.surface,flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:10,color:CL.txtDim}}>Monthly add-ons</span><span style={{fontSize:12,fontWeight:700,color:CL.blue}}>+${featureMonthlyCost}/mo</span></div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                  {[...enabledFeatures].map(fid=>{const f=STUDIO_FEATURES.find(f=>f.id===fid);return f?<span key={fid} style={{fontSize:9,padding:"1px 7px",borderRadius:10,background:CL.blueBg,color:CL.blue,border:`1px solid ${CL.blueBdr}`}}>{f.name.split(" ")[0]}</span>:null;})}
                  {enabledFeatures.size===0&&<span style={{fontSize:10,color:CL.txtDim}}>No features selected</span>}
                </div>
              </div>
              <div style={{padding:"8px 10px",borderBottom:`1px solid ${CL.border}`,background:CL.surface}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{FEAT_CATS.map(cat=><button key={cat.id} onClick={()=>setFeatureFilter(cat.id)} style={{padding:"2px 7px",borderRadius:5,fontSize:9,border:`1px solid ${featureFilter===cat.id?CL.blue:CL.border}`,background:featureFilter===cat.id?"rgba(26,95,158,0.1)":"transparent",color:featureFilter===cat.id?CL.blue:CL.txtDim,cursor:"pointer",fontWeight:featureFilter===cat.id?700:400}}>{cat.label}</button>)}</div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:10,display:"flex",flexDirection:"column",gap:7}}>{filteredFeatures.map(f=><FeatureCard key={f.id} feature={f} isEnabled={enabledFeatures.has(f.id)} onToggle={toggleFeature}/>)}</div>
            </div>
          )}
          {activePanel==="design"&&(
            <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:14}}>
              <div><label style={{display:"block",fontSize:10,color:CL.txtDim,marginBottom:7,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>Accent Color</label><div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:7}}>{[CL.brand,"#b91c1c","#1e40af","#15803d","#b45309","#8b5cf6"].map(c=><button key={c} onClick={()=>setData(p=>({...p,_accentOverride:c}))} style={{width:26,height:26,borderRadius:"50%",background:c,border:`2px solid ${data._accentOverride===c?CL.txt:"transparent"}`,cursor:"pointer"}}/>)}</div><input type="color" value={data._accentOverride||CL.brand} onChange={e=>setData(p=>({...p,_accentOverride:e.target.value}))} style={{width:"100%",height:34,borderRadius:7,cursor:"pointer",border:`1px solid ${CL.border}`,background:"transparent"}}/></div>
              <div><label style={{display:"block",fontSize:10,color:CL.txtDim,marginBottom:7,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>Display Font</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{["Syne","Space Grotesk","Playfair Display","Outfit"].map(f=><button key={f} onClick={()=>setActiveTemplate(t=>({...t,fontDisplay:f}))} style={{padding:"7px",borderRadius:7,fontSize:10,fontFamily:f,border:`1px solid ${activeTemplate.fontDisplay===f?CL.brand:CL.border}`,background:activeTemplate.fontDisplay===f?CL.brandBg:CL.surface,color:activeTemplate.fontDisplay===f?CL.brand:CL.txt,cursor:"pointer"}}>{f}</button>)}</div></div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>{[{k:"businessName",l:"Business Name"},{k:"phone",l:"Phone"},{k:"email",l:"Email"},{k:"address",l:"Address"},{k:"hours",l:"Hours"}].map(f=><div key={f.k}><label style={{display:"block",fontSize:10,color:CL.txtDim,marginBottom:3,fontWeight:600}}>{f.l}</label><input value={data[f.k]||""} onChange={e=>setData(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",padding:"7px 9px",borderRadius:7,background:CL.surface,border:`1px solid ${CL.border}`,fontSize:11,color:CL.txt,outline:"none",boxSizing:"border-box"}}/></div>)}</div>
            </div>
          )}
          {activePanel==="seo"&&(
            <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{padding:10,borderRadius:9,background:CL.surface,border:`1px solid ${CL.border}`}}>
                <div style={{fontSize:9,fontWeight:700,color:CL.txtDim,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.1em"}}>Google Preview</div>
                <div style={{color:"#1a0dab",fontSize:12,fontWeight:500,marginBottom:2}}>{seoData.title||data.businessName}</div>
                <div style={{color:"#006621",fontSize:10,marginBottom:3}}>{credentials.siteUrl}</div>
                <div style={{color:"#545454",fontSize:10,lineHeight:1.5}}>{seoData.desc.slice(0,160)}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[{k:"title",l:"Page Title",max:60,h:false,v:seoData.title,s:(v)=>setSeoData(p=>({...p,title:v}))},{k:"desc",l:"Meta Description",max:160,h:true,v:seoData.desc,s:(v)=>setSeoData(p=>({...p,desc:v}))}].map(f=><div key={f.k}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><label style={{fontSize:10,color:CL.txtDim,fontWeight:600}}>{f.l}</label><span style={{fontSize:9,color:f.v.length>f.max?CL.red:CL.txtDim}}>{f.v.length}/{f.max}</span></div>{f.h?<textarea rows={3} value={f.v} onChange={e=>f.s(e.target.value)} style={{width:"100%",padding:"7px 9px",borderRadius:7,background:CL.surface,border:`1px solid ${CL.border}`,fontSize:10,color:CL.txt,outline:"none",resize:"none",boxSizing:"border-box"}}/>:<input value={f.v} onChange={e=>f.s(e.target.value)} style={{width:"100%",padding:"7px 9px",borderRadius:7,background:CL.surface,border:`1px solid ${CL.border}`,fontSize:10,color:CL.txt,outline:"none",boxSizing:"border-box"}}/>}</div>)}
                <div><label style={{display:"block",fontSize:10,color:CL.txtDim,marginBottom:3,fontWeight:600}}>Keywords</label><input value={seoData.keywords} onChange={e=>setSeoData(p=>({...p,keywords:e.target.value}))} placeholder="keyword1, keyword2..." style={{width:"100%",padding:"7px 9px",borderRadius:7,background:CL.surface,border:`1px solid ${CL.border}`,fontSize:10,color:CL.txt,outline:"none",boxSizing:"border-box"}}/></div>
              </div>
              <div style={{padding:"10px 12px",borderRadius:9,background:CL.sidebar,border:`1px solid ${CL.border}`}}>
                <div style={{fontSize:9,fontWeight:700,color:CL.txtDim,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.08em"}}>SEO Health</div>
                {[
                  {l:"Title length OK (20–60 chars)", ok:seoData.title.length>=20&&seoData.title.length<=60},
                  {l:"Description length OK (80–160 chars)", ok:seoData.desc.length>=80&&seoData.desc.length<=160},
                  {l:"Keywords set", ok:seoData.keywords.length>0},
                  {l:"Business name in title", ok:seoData.title.toLowerCase().includes((data.businessName||"").toLowerCase().slice(0,5))},
                ].map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                    {item.ok?<CheckCircle size={10} style={{color:CL.green,flexShrink:0}}/>:<AlertCircle size={10} style={{color:CL.amber,flexShrink:0}}/>}
                    <span style={{fontSize:10,color:item.ok?CL.txtMid:CL.txtDim}}>{item.l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activePanel==="content"&&(
            <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:12}}>
              <div style={{padding:"6px 10px",borderRadius:7,background:CL.blueBg,border:`1px solid ${CL.blueBdr}`,fontSize:10,color:CL.blue}}>Edit your site content below — preview updates live.</div>
              {[{k:"businessName",l:"Business Name"},{k:"tagline",l:"Hero Tagline"},{k:"about",l:"About Text",h:true},{k:"phone",l:"Phone"},{k:"email",l:"Email"}].map(f=><div key={f.k}><label style={{display:"block",fontSize:10,color:CL.txtDim,marginBottom:3,fontWeight:600}}>{f.l}</label>{f.h?<textarea rows={3} value={data[f.k]||""} onChange={e=>setData(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",padding:"7px 9px",borderRadius:7,background:CL.surface,border:`1px solid ${CL.border}`,fontSize:10,color:CL.txt,outline:"none",resize:"none",boxSizing:"border-box"}}/>:<input value={data[f.k]||""} onChange={e=>setData(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",padding:"7px 9px",borderRadius:7,background:CL.surface,border:`1px solid ${CL.border}`,fontSize:10,color:CL.txt,outline:"none",boxSizing:"border-box"}}/>}</div>)}
              <div>
                <div style={{fontSize:10,color:CL.txtDim,marginBottom:6,fontWeight:600}}>Services</div>
                {(data.services||[]).map((s,i)=><div key={i} style={{padding:"7px 9px",borderRadius:7,background:CL.surface,border:`1px solid ${CL.border}`,display:"flex",flexDirection:"column",gap:3,marginBottom:5}}><input value={s.name} onChange={e=>{const u=[...data.services];u[i]={...u[i],name:e.target.value};setData(p=>({...p,services:u}));}} style={{background:"transparent",border:"none",borderBottom:`1px solid ${CL.border}`,paddingBottom:3,fontSize:10,fontWeight:700,color:CL.txt,outline:"none",width:"100%"}}/><input value={s.desc} onChange={e=>{const u=[...data.services];u[i]={...u[i],desc:e.target.value};setData(p=>({...p,services:u}));}} style={{background:"transparent",border:"none",fontSize:9,color:CL.txtMid,outline:"none",width:"100%"}}/></div>)}
              </div>
              <div style={{padding:"10px 0",borderTop:`1px solid ${CL.border}`}}>
                <a href={credentials.adminUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px",borderRadius:7,background:CL.sidebar,border:`1px solid ${CL.border}`,color:CL.txtMid,fontSize:10,textDecoration:"none",marginBottom:5}}><ExternalLink size={10}/> WordPress Admin</a>
                <div style={{display:"flex",gap:5}}>{[{l:"Username",v:credentials.username,k:"u"},{l:"Password",v:credentials.password,k:"p"}].map(c=><button key={c.k} onClick={()=>copyText(c.v,c.k)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:3,padding:"5px",borderRadius:7,background:CL.sidebar,border:`1px solid ${CL.border}`,fontSize:9,color:CL.txtDim,cursor:"pointer"}}>{copied===c.k?<CheckCircle size={9} style={{color:CL.green}}/>:<Copy size={9}/>} {c.l}</button>)}</div>
              </div>
            </div>
          )}
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,background:CL.hover}}>
          <div style={{padding:"7px 14px",borderBottom:`1px solid ${CL.border}`,display:"flex",alignItems:"center",gap:9,flexShrink:0,background:CL.surface}}>
            <div style={{display:"flex",gap:4}}><div style={{width:9,height:9,borderRadius:"50%",background:"#F87171",opacity:.7}}/><div style={{width:9,height:9,borderRadius:"50%",background:"#FCD34D",opacity:.7}}/><div style={{width:9,height:9,borderRadius:"50%",background:"#4ADE80",opacity:.7}}/></div>
            <div style={{flex:1,borderRadius:5,padding:"4px 10px",display:"flex",alignItems:"center",gap:5,background:CL.sidebar,border:`1px solid ${CL.border}`}}><Lock size={8} style={{color:CL.green,flexShrink:0}}/><span style={{fontSize:10,color:CL.txtDim,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{credentials.siteUrl}</span></div>
            {previewTemplate&&<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:10,fontWeight:600,color:CL.brand}}>Previewing: {previewTemplate.name}</span><button onClick={()=>setPreviewTemplate(null)} style={{background:"none",border:"none",cursor:"pointer",color:CL.txtDim}}><X size={12}/></button><button onClick={()=>{setActiveTemplate(previewTemplate);setPreviewTemplate(null);}} style={{padding:"3px 9px",borderRadius:5,background:CL.brand,color:"#fff",fontSize:9,fontWeight:700,border:"none",cursor:"pointer"}}>Apply</button></div>}
          </div>
          <div style={{flex:1,overflow:"auto",display:"flex",justifyContent:"center",padding:viewport==="desktop"?0:14,background:CL.hover}}>
            <div style={{width:vpWidth[viewport],maxWidth:"100%",transition:"width .3s cubic-bezier(.4,0,.2,1)",flexShrink:0,height:"100%",overflowY:"auto"}}><SitePreview data={data} tmpl={displayTemplate}/></div>
          </div>
          {previewTemplate&&<div style={{padding:"9px 14px",borderTop:`1px solid ${CL.brandBdr}`,background:CL.brandBg,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}><span style={{fontSize:11,color:CL.brand}}>Previewing <strong>{previewTemplate.name}</strong> — not applied yet</span><div style={{display:"flex",gap:7}}><button onClick={()=>setPreviewTemplate(null)} style={{padding:"3px 10px",borderRadius:5,fontSize:10,color:CL.txtDim,background:"none",border:"none",cursor:"pointer"}}>Cancel</button><button onClick={()=>{setActiveTemplate(previewTemplate);setPreviewTemplate(null);}} style={{padding:"3px 10px",borderRadius:5,fontSize:10,fontWeight:700,background:CL.brand,color:"#fff",border:"none",cursor:"pointer"}}>Apply Template</button></div></div>}
        </div>
      </div>
    </div>
  );
}

function PublishGate({siteData,onReset}){
  return(
    <div style={{minHeight:"100vh",background:CL.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:CL.sans}}>
      <style>{FONTS}{ANIM}</style>
      <div style={{width:"100%",maxWidth:440,textAlign:"center"}}>
        <div className="fade-up" style={{width:80,height:80,borderRadius:20,background:CL.brandBg,border:`1px solid ${CL.brandBdr}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"}}><Globe size={36} style={{color:CL.brand}}/></div>
        <h1 className="fade-up" style={{fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,margin:"0 0 12px",color:CL.txt,animationDelay:".1s"}}>Ready to go live?</h1>
        <p className="fade-up" style={{color:CL.txtMid,marginBottom:32,lineHeight:1.7,animationDelay:".15s"}}>{siteData.businessName} is built and customized.</p>
        <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:32,textAlign:"left",animationDelay:".2s"}}>
          {["Your own domain","SSL certificate","Daily backups","Uptime monitoring","Priority support"].map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:CL.txt}}><CheckCircle size={14} style={{color:CL.brand,flexShrink:0}}/>{f}</div>)}
        </div>
        <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:10,animationDelay:".3s"}}>
          <button className="glow-brand" style={{width:"100%",padding:"16px",borderRadius:14,fontWeight:800,fontSize:17,background:CL.brand,color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>Go Live — $11.99/mo <ArrowRight size={20}/></button>
          <button onClick={onReset} style={{width:"100%",padding:"12px",color:CL.txtDim,fontSize:13,background:"none",border:"none",cursor:"pointer"}}>Build another site</button>
        </div>
      </div>
    </div>
  );
}

// ── Demo Data ──────────────────────────────────────────────
const DEMO_CREDS={siteUrl:"https://demo.staging.xusmo.io",adminUrl:"https://demo.staging.xusmo.io/wp-admin",username:"owner",password:"sf_demo"};
const DEMO_SITE={businessName:"Fast Pipes Toronto",city:"Toronto",tradeType:"Plumbing",tagline:"Toronto's Most Trusted Plumbers",services:[{name:"Emergency Repairs",desc:"24/7 plumbing emergencies."},{name:"Drain Cleaning",desc:"Same-day drain unclogging."},{name:"Water Heaters",desc:"Install, repair, and replace."},{name:"Leak Detection",desc:"Non-invasive pipe leak detection."},{name:"Bathroom Renos",desc:"Full bathroom plumbing renos."}],hours:"Mon–Fri 7am–6pm, Sat 8am–2pm",yearsInBusiness:"8",licenses:"Licensed & Insured",phone:"(416) 555-0100",email:"info@fastpipestoronto.ca",address:"100 Main St, Toronto ON",about:"Toronto's most trusted plumbing team with 8+ years serving the GTA. Fast response, upfront pricing, guaranteed work.",testimonials:[{name:"Mike T.",text:"Came within an hour. Professional and fair pricing.",rating:5},{name:"Sarah K.",text:"Great work, very clean. Would highly recommend.",rating:5},{name:"James L.",text:"Fixed what two other plumbers couldn't.",rating:5}],pages:["Home","Services","About","Contact"],seoTitle:"Fast Pipes Toronto | Plumbing in Toronto",seoDescription:"Professional plumbing in Toronto.",seoKeywords:"plumbing toronto"};

export default function App(){
  const [view,setView]=useState("landing");
  const [quickData,setQuickData]=useState(null);
  const [siteData,setSiteData]=useState(null);
  const [credentials,setCredentials]=useState(null);
  const goAdmin=()=>setView("admin");
  const goStudio=()=>setView(siteData&&credentials?"studio":"landing");
  const creds=credentials||DEMO_CREDS;
  const site=siteData||DEMO_SITE;
  if(view==="admin") return <AdminPanel onGoToStudio={goStudio}/>;
  return(
    <div style={{fontFamily:CL.sans}}>
      <style>{FONTS}{ANIM}</style>
      {view==="landing"   && <Landing   onStart={()=>setView("intake")} onAdmin={goAdmin}/>}
      {view==="intake"    && <Intake    onSubmit={d=>{setQuickData(d);setView("interview");}} onBack={()=>setView("landing")}/>}
      {view==="interview" && <Interview quickData={quickData} onComplete={d=>{setSiteData(d);setView("building");}} onBack={()=>setView("intake")}/>}
      {view==="building"  && <Building  siteData={siteData} onDone={c=>{setCredentials(c);setView("studio");}}/>}
      {view==="studio"    && <Studio    siteData={site} credentials={creds} onPublish={()=>setView("publish")} onAdmin={goAdmin}/>}
      {view==="publish"   && <PublishGate siteData={site} onReset={()=>{setSiteData(null);setCredentials(null);setView("landing");}}/>}
    </div>
  );
}
