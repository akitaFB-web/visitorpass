import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "visitorpass-data-v1";
const ADMIN_SESSION_KEY = "visitorpass-admin-session";
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyUYYtv_EBVr10uiJ0RrNX5f7IzAEg0tdi15rv7y8Tu95nQ77Qf7-nQDJUmKoGgar8V/exec'; // ← ใส่ URL ของคุณ
const LOGO_B64 = "data:image/png;base64,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"; // ← ใช้ Base64 จากไฟล์ที่ดาวน์โหลด
const COMPANY_NAME = "AKITA FB (THAILAND) CO.,LTD.";

function loadVisitors() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveVisitors(v) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch {}
}
function loadAdminSession() {
  try { return localStorage.getItem(ADMIN_SESSION_KEY) === 'true'; } catch { return false; }
}
function saveAdminSession(v) {
  try { localStorage.setItem(ADMIN_SESSION_KEY, v ? 'true' : ''); } catch {}
}

const genId    = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const genToken = () => Math.random().toString(36).slice(2, 18);
const now      = () => new Date().toISOString();
const thaiDate = (iso) => iso ? new Date(iso).toLocaleString("th-TH", { dateStyle:"medium", timeStyle:"short" }) : "-";

const STATUS = {
  pending:  { label:"รออนุมัติ",   color:"#f59e0b", bg:"rgba(245,158,11,.12)" },
  approved: { label:"อนุมัติแล้ว", color:"#10b981", bg:"rgba(16,185,129,.12)" },
  rejected: { label:"ปฏิเสธ",      color:"#ef4444", bg:"rgba(239,68,68,.12)"  },
};

function sendToGAS(payload) {
  try {
    const url = GAS_URL + '?data=' + encodeURIComponent(JSON.stringify(payload));
    const img = document.createElement('img');
    img.src = url; img.style.display = 'none';
    document.body.appendChild(img);
    setTimeout(() => document.body.removeChild(img), 3000);
  } catch(e) { console.error('GAS error:', e); }
}

async function fetchFromGAS(params) {
  const url = GAS_URL + '?' + new URLSearchParams(params).toString();
  const res = await fetch(url);
  return await res.json();
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#0b0f17;--s1:#111827;--s2:#1a2236;--s3:#1e2a40;
      --br:#253047;--br2:#2e3c57;
      --ac:#00d9b0;--ab:#0ea5e9;--aw:#f59e0b;--ae:#ef4444;--ag:#10b981;
      --t1:#e8f0fe;--t2:#94a3b8;--t3:#64748b;
      --r:10px;--sh:0 4px 32px rgba(0,0,0,.45);
    }
    body{font-family:'Noto Sans Thai',sans-serif;background:var(--bg);color:var(--t1);min-height:100vh}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--br);border-radius:3px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes prog{from{width:100%}to{width:0%}}
    .fu{animation:fadeUp .35s ease both}
    .inp{width:100%;background:var(--s1);border:1.5px solid var(--br);border-radius:8px;color:var(--t1);font-family:inherit;font-size:13.5px;padding:10px 13px;outline:none;transition:border-color .2s,box-shadow .2s;}
    .inp:focus{border-color:var(--ac);box-shadow:0 0 0 3px rgba(0,217,176,.1)}
    .inp.err{border-color:var(--ae)}.inp::placeholder{color:var(--t3)}
    textarea.inp{resize:vertical;min-height:76px;line-height:1.6}
    .inp-num{width:90px;text-align:center;font-family:'DM Mono',monospace;font-size:15px;font-weight:600;}
    .btn{display:inline-flex;align-items:center;gap:7px;border:none;cursor:pointer;font-family:inherit;font-weight:600;border-radius:8px;transition:all .18s;font-size:13.5px;}
    .btn:disabled{opacity:.45;cursor:not-allowed}
    .btn-p{background:linear-gradient(135deg,var(--ac),#00b4d8);color:#071020;padding:11px 26px}
    .btn-p:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 4px 18px rgba(0,217,176,.3)}
    .btn-s{background:var(--s3);color:var(--t1);border:1.5px solid var(--br2);padding:10px 20px}
    .btn-s:hover:not(:disabled){border-color:var(--ac);color:var(--ac)}
    .btn-ok{background:var(--ag);color:#fff;padding:10px 22px}
    .btn-ok:hover:not(:disabled){background:#059669;transform:translateY(-1px)}
    .btn-ng{background:var(--ae);color:#fff;padding:10px 22px}
    .btn-ng:hover:not(:disabled){background:#dc2626;transform:translateY(-1px)}
    .btn-del{background:rgba(239,68,68,.12);color:var(--ae);border:1px solid rgba(239,68,68,.25);padding:6px 14px;font-size:12px;border-radius:7px;}
    .btn-del:hover:not(:disabled){background:var(--ae);color:#fff;}
    .btn-gh{background:transparent;color:var(--t2);padding:8px 14px;font-size:13px}
    .btn-gh:hover{color:var(--t1);background:var(--s2)}
    .card{background:var(--s1);border:1px solid var(--br);border-radius:var(--r);box-shadow:var(--sh)}
    .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 11px;border-radius:20px;font-size:12px;font-weight:600;}
    .badge::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0}
    .divider{height:1px;background:var(--br);margin:18px 0}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
    @media(max-width:600px){.g2,.g3{grid-template-columns:1fr}}
    .sec-label{font-size:10.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:var(--t3);display:flex;align-items:center;gap:8px;margin-bottom:14px;}
    .sec-label::before{content:'';width:3px;height:13px;background:var(--ac);border-radius:2px;display:block}
    .sec-label::after{content:'';flex:1;height:1px;background:var(--br)}
    .fld{display:flex;flex-direction:column;gap:5px}
    .fld-label{font-size:12.5px;font-weight:500;color:var(--t2)}
    .err-msg{font-size:11px;color:var(--ae)}
    .name-row{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--s2);border-radius:8px;border:1px solid var(--br);}
    .name-idx{font-family:'DM Mono',monospace;font-size:11px;color:var(--t3);width:20px;flex-shrink:0;text-align:right;}
    table{width:100%;border-collapse:collapse}
    th{background:var(--s2);color:var(--t3);font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:10px 16px;text-align:left;}
    td{padding:11px 16px;border-bottom:1px solid var(--br);font-size:13px;vertical-align:middle}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:rgba(255,255,255,.018)}
    .tab-btn{padding:9px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;border:1.5px solid transparent;background:transparent;color:var(--t3);transition:all .18s;font-family:inherit;white-space:nowrap;}
    .tab-btn.on{background:var(--s2);color:var(--ac);border-color:var(--br2)}
    .tab-btn:hover:not(.on){color:var(--t1);background:var(--s2)}
    .stat{background:var(--s1);border:1px solid var(--br);border-radius:var(--r);padding:18px 20px;display:flex;flex-direction:column;gap:4px;}
    .stat-n{font-size:30px;font-weight:700;font-family:'DM Mono',monospace;line-height:1}
    .stat-l{font-size:11.5px;color:var(--t3);font-weight:500}
    .empty{text-align:center;padding:56px 20px;color:var(--t3)}
    .panel{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
    .panel-box{background:var(--s1);border:1px solid var(--br2);border-radius:14px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.6);animation:fadeUp .28s ease;}
    .panel-head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--br);position:sticky;top:0;background:var(--s1);z-index:1;}
    .panel-body{padding:24px}.panel-foot{padding:16px 24px;border-top:1px solid var(--br);display:flex;justify-content:flex-end;gap:10px;position:sticky;bottom:0;background:var(--s1);}
    .toast{position:fixed;bottom:24px;right:24px;z-index:999;background:var(--s2);border:1px solid var(--br2);padding:14px 20px;border-radius:10px;font-size:13.5px;box-shadow:var(--sh);max-width:340px;animation:fadeUp .3s ease;display:flex;align-items:center;gap:10px;cursor:pointer;}
    .toast-ok{border-left:4px solid var(--ag)}.toast-er{border-left:4px solid var(--ae)}
    .progress-wrap{height:3px;background:var(--br);border-radius:2px;overflow:hidden;margin-top:8px}
    .progress-bar{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--ac),var(--ab));animation:prog 3.5s linear forwards}
    .approve-card{background:linear-gradient(135deg,rgba(0,217,176,.06),rgba(14,165,233,.06));border:1.5px solid rgba(0,217,176,.25);border-radius:14px;padding:28px;}
    .loader-spin{display:inline-block;width:18px;height:18px;border:2.5px solid rgba(255,255,255,.2);border-top-color:var(--ac);border-radius:50%;animation:spin .7s linear infinite;}
    .danger-box{background:rgba(239,68,68,.06);border:1.5px solid rgba(239,68,68,.2);border-radius:10px;padding:16px 20px;}
    .counter-ctrl{display:flex;align-items:center;gap:0;border:1.5px solid var(--br);border-radius:8px;overflow:hidden;width:fit-content;}
    .counter-btn{width:36px;height:38px;background:var(--s2);border:none;color:var(--t1);font-size:18px;cursor:pointer;transition:background .15s;display:flex;align-items:center;justify-content:center;}
    .counter-btn:hover{background:var(--br2)}
    .counter-val{min-width:48px;height:38px;background:var(--s1);color:var(--t1);font-family:'DM Mono',monospace;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;border-left:1px solid var(--br);border-right:1px solid var(--br);}
  `}</style>
);

function Toast({ items, remove }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:999, display:"flex", flexDirection:"column", gap:10 }}>
      {items.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
          <span style={{ fontSize:18 }}>{t.type==="ok"?"✅":"❌"}</span>
          <div><div>{t.msg}</div><div className="progress-wrap"><div className="progress-bar"/></div></div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, error, children, hint }) {
  return (
    <div className="fld">
      {label && <label className="fld-label">{label}{hint && <span style={{ fontWeight:400, color:"var(--t3)", marginLeft:6 }}>{hint}</span>}</label>}
      {children}
      {error && <span className="err-msg">⚠ {error}</span>}
    </div>
  );
}

// ─── Token Approve Page ───────────────────────────────────────────────────────
function TokenApprovePage({ visitors, onApprove, onReject }) {
  const params  = new URLSearchParams(window.location.search);
  const id      = params.get('id');
  const token   = params.get('token');
  const visitor = visitors.find(v => v.id === id && v.token === token);
  const [panel, setPanel] = useState(null);
  const [note,  setNote]  = useState("");
  const [done,  setDone]  = useState(null);

  if (!visitor) return (
    <Center><div style={{ textAlign:"center" }} className="fu">
      <div style={{ fontSize:64, marginBottom:16 }}>🔒</div>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>ลิงก์ไม่ถูกต้องหรือหมดอายุ</h2>
      <p style={{ color:"var(--t2)" }}>กรุณาติดต่อผู้ส่งคำร้อง</p>
    </div></Center>
  );

  if (visitor.status !== "pending" && !done) return (
    <Center><div style={{ textAlign:"center" }} className="fu">
      <div style={{ fontSize:64, marginBottom:16 }}>{visitor.status==="approved"?"✅":"❌"}</div>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>{visitor.status==="approved"?"อนุมัติไปแล้ว":"ปฏิเสธไปแล้ว"}</h2>
      <p style={{ color:"var(--t2)" }}>คำร้องนี้ได้รับการพิจารณาแล้ว</p>
    </div></Center>
  );

  if (done) return (
    <Center><div style={{ textAlign:"center" }} className="fu">
      <div style={{ fontSize:64, marginBottom:16 }}>{done==="approved"?"✅":"❌"}</div>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>{done==="approved"?"อนุมัติเรียบร้อยแล้ว":"ปฏิเสธเรียบร้อยแล้ว"}</h2>
      <p style={{ color:"var(--t2)" }}>ปิดหน้าต่างนี้ได้เลยครับ</p>
    </div></Center>
  );

  const confirm = (action) => {
    if (action==="approved") onApprove(visitor.id, note);
    else onReject(visitor.id, note);
    setDone(action); setPanel(null);
  };

  const names = visitor.visitorNames || [];

  return (
    <Center>
      <div style={{ width:"100%", maxWidth:580 }} className="fu">
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <img src={LOGO_B64} alt="logo" style={{ height:34, width:"auto", objectFit:"contain" }}/>
              <span style={{ fontWeight:800, fontSize:15, color:"var(--t1)" }}>VisitorPass</span>
            </div>
            <span style={{ fontSize:13.5, fontWeight:600, color:"var(--t2)" }}>{COMPANY_NAME}</span>
          </div>
          </div>
          <h1 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>คำร้องขอเข้าโรงงาน</h1>
          <p style={{ color:"var(--t2)", fontSize:13 }}>กรุณาพิจารณาคำร้องด้านล่าง</p>
        </div>
        <div className="approve-card" style={{ marginBottom:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 24px", marginBottom: names.length ? 16 : 0 }}>
            {[
              ["👤 ผู้ร้องขอ", `${visitor.requesterName} (${visitor.employeeId})`],
              ["🏭 แผนก", visitor.department],
              ["🏢 บริษัทผู้เข้าเยี่ยม", visitor.company],
              ["👥 จำนวนคน", `${visitor.visitorCount} คน`],
              ["🎯 วัตถุประสงค์", visitor.purpose],
              ["📍 พื้นที่", visitor.area],
              ["📅 วันที่", `${visitor.dateFrom}${visitor.dateTo && visitor.dateTo !== visitor.dateFrom ? " ถึง " + visitor.dateTo : ""}`],
              ["🕐 เวลา", `${visitor.enterTime} – ${visitor.exitTime}`],
            ].map(([l,v]) => (
              <div key={l}><div style={{ fontSize:11, color:"var(--t3)", marginBottom:3 }}>{l}</div><div style={{ fontSize:13.5, fontWeight:600 }}>{v||"-"}</div></div>
            ))}
          </div>
          {names.length > 0 && (
            <div>
              <div style={{ fontSize:11, color:"var(--t3)", marginBottom:8 }}>📋 รายชื่อผู้เข้าเยี่ยม</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {names.map((n,i) => (
                  <div key={i} className="name-row">
                    <span className="name-idx">{i+1}.</span>
                    <span style={{ fontSize:13.5, fontWeight:600 }}>{n||"-"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Field label="หมายเหตุ (ถ้ามี)">
          <textarea className="inp" placeholder="ระบุเหตุผลหรือเงื่อนไข..." value={note} onChange={e => setNote(e.target.value)} style={{ minHeight:80 }}/>
        </Field>
        <div style={{ display:"flex", gap:12, marginTop:20 }}>
          <button className="btn btn-ng" onClick={() => setPanel("rejected")} style={{ flex:1, justifyContent:"center", fontSize:15, padding:"13px" }}>❌ ปฏิเสธ</button>
          <button className="btn btn-ok" onClick={() => setPanel("approved")} style={{ flex:1, justifyContent:"center", fontSize:15, padding:"13px" }}>✅ อนุมัติ</button>
        </div>
        {panel && (
          <div className="panel" onClick={e => e.target===e.currentTarget && setPanel(null)}>
            <div className="panel-box">
              <div className="panel-head">
                <div style={{ fontWeight:700, fontSize:16 }}>{panel==="approved"?"✅ ยืนยันการอนุมัติ":"❌ ยืนยันการปฏิเสธ"}</div>
                <button className="btn btn-gh" onClick={() => setPanel(null)} style={{ padding:"4px 10px", fontSize:16 }}>✕</button>
              </div>
              <div className="panel-body">
                <p style={{ color:"var(--t2)", fontSize:13.5 }}>{visitor.company} · {visitor.visitorCount} คน</p>
                {note && <div style={{ background:"var(--s2)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"var(--t2)", marginTop:12 }}>หมายเหตุ: {note}</div>}
              </div>
              <div className="panel-foot">
                <button className="btn btn-gh" onClick={() => setPanel(null)}>ยกเลิก</button>
                <button className={`btn ${panel==="approved"?"btn-ok":"btn-ng"}`} onClick={() => confirm(panel)}>
                  {panel==="approved"?"✅ ยืนยันอนุมัติ":"❌ ยืนยันปฏิเสธ"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Center>
  );
}

function Center({ children }) {
  return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>{children}</div>;
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const login = async () => {
    if (!password.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetchFromGAS({ action:'getAll', password });
      if (res.success) onLogin(password, res.visitors);
      else setError("รหัสผ่านไม่ถูกต้อง");
    } catch { setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่"); }
    setLoading(false);
  };

  return (
    <Center>
      <div style={{ width:"100%", maxWidth:380 }} className="fu">
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:64, height:64, borderRadius:16, marginBottom:16, background:"linear-gradient(135deg,rgba(0,217,176,.15),rgba(14,165,233,.15))", border:"1px solid rgba(0,217,176,.4)", fontSize:28 }}>🔐</div>
          <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Admin Dashboard</h1>
          <p style={{ color:"var(--t2)", fontSize:13.5 }}>ใส่รหัสผ่านเพื่อเข้าใช้งาน</p>
        </div>
        <div className="card" style={{ padding:28 }}>
          <Field label="รหัสผ่าน" error={error}>
            <input type="password" className={`inp${error?" err":""}`} placeholder="กรอกรหัสผ่าน" value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key==="Enter" && login()} autoFocus/>
          </Field>
          <button className="btn btn-p" onClick={login} disabled={loading||!password.trim()} style={{ width:"100%", justifyContent:"center", marginTop:16, fontSize:14 }}>
            {loading ? <><div className="loader-spin"/> กำลังตรวจสอบ...</> : "🔓 เข้าสู่ระบบ"}
          </button>
        </div>
      </div>
    </Center>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ password, initialVisitors, onLogout, toast }) {
  const [visitors,     setVisitors]     = useState(initialVisitors || []);
  const [filter,       setFilter]       = useState("all");
  const [search,       setSearch]       = useState("");
  const [detail,       setDetail]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFromGAS({ action:'getAll', password });
      if (res.success) { setVisitors(res.visitors); setLastUpdated(new Date()); }
    } catch {}
    setLoading(false);
  }, [password]);

  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      sendToGAS({ action:'delete', id:deleteTarget.id, password });
      setVisitors(prev => prev.filter(v => v.id !== deleteTarget.id));
      toast(`🗑️ ลบข้อมูลของ ${deleteTarget.company} แล้ว`);
      setDeleteTarget(null);
      setDetail(null);
    } catch { toast("❌ ลบไม่สำเร็จ กรุณาลองใหม่", "er"); }
    setDeleting(false);
  };

  const stats = {
    total:    visitors.length,
    pending:  visitors.filter(v => v.status==="pending").length,
    approved: visitors.filter(v => v.status==="approved").length,
    rejected: visitors.filter(v => v.status==="rejected").length,
  };

  const list = visitors.filter(v => {
    if (filter!=="all" && v.status!==filter) return false;
    const q = search.toLowerCase();
    return !q || [v.company, v.department, v.requesterName, v.area, ...(v.visitorNames||[])].some(x => x?.toLowerCase().includes(q));
  });

  return (
    <div className="fu" style={{ maxWidth:1100, margin:"0 auto", padding:"36px 24px 80px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14, marginBottom:28 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>🔐 Admin Dashboard</h2>
          <p style={{ fontSize:12.5, color:"var(--t3)" }}>
            อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}
            {loading && <span style={{ marginLeft:8 }}><span className="loader-spin" style={{ width:12, height:12, borderWidth:2, verticalAlign:"middle" }}/></span>}
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-s" onClick={refresh} disabled={loading} style={{ fontSize:13 }}>🔄 รีเฟรช</button>
          <button className="btn btn-gh" onClick={onLogout} style={{ fontSize:13, border:"1.5px solid var(--br2)", borderRadius:8 }}>🚪 ออกจากระบบ</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[{n:stats.total,l:"ทั้งหมด",c:"var(--ab)"},{n:stats.pending,l:"รออนุมัติ",c:"var(--aw)"},{n:stats.approved,l:"อนุมัติแล้ว",c:"var(--ag)"},{n:stats.rejected,l:"ปฏิเสธ",c:"var(--ae)"}].map(s => (
          <div className="stat" key={s.l}><div className="stat-n" style={{ color:s.c }}>{s.n}</div><div className="stat-l">{s.l}</div></div>
        ))}
      </div>

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:14 }}>
        <input className="inp" placeholder="🔍 ค้นหา บริษัท / แผนก / ผู้ร้องขอ / พื้นที่..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:340 }}/>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[["all","ทั้งหมด"],["pending","รออนุมัติ"],["approved","อนุมัติ"],["rejected","ปฏิเสธ"]].map(([k,l]) => (
            <button key={k} className={`tab-btn${filter===k?" on":""}`} onClick={() => setFilter(k)} style={{ fontSize:12, padding:"7px 14px" }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        {list.length===0 ? (
          <div className="empty"><div style={{ fontSize:44, marginBottom:12, opacity:.4 }}>📋</div><p style={{ fontWeight:600, color:"var(--t2)" }}>ไม่พบข้อมูล</p></div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table>
              <thead>
                <tr><th>รหัส</th><th>บริษัท</th><th>จำนวน</th><th>วันที่</th><th>พื้นที่</th><th>ผู้ร้องขอ / แผนก</th><th>สถานะ</th><th></th></tr>
              </thead>
              <tbody>
                {list.map(v => (
                  <tr key={v.id}>
                    <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:"var(--t3)" }}>{v.id}</span></td>
                    <td style={{ fontWeight:600 }}>{v.company}</td>
                    <td><span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:"var(--ab)" }}>{v.visitorCount}</span> คน</td>
                    <td>
                      <div style={{ fontSize:12.5 }}>{v.dateFrom}{v.dateTo&&v.dateTo!==v.dateFrom?<span style={{ color:"var(--t3)" }}> – {v.dateTo}</span>:""}</div>
                      <div style={{ fontSize:11.5, color:"var(--t3)" }}>{v.enterTime} – {v.exitTime}</div>
                    </td>
                    <td style={{ color:"var(--t2)", fontSize:12.5 }}>{v.area}</td>
                    <td>
                      <div style={{ fontSize:12.5 }}>{v.requesterName}</div>
                      <div style={{ fontSize:11.5, color:"var(--t3)" }}>{v.department}</div>
                    </td>
                    <td><span className="badge" style={{ color:STATUS[v.status]?.color, background:STATUS[v.status]?.bg }}>{STATUS[v.status]?.label}</span></td>
                    <td>
                      <div style={{ display:"flex", gap:6 }}>
                        <button className="btn btn-gh" onClick={() => setDetail(v)} style={{ fontSize:12, padding:"5px 12px" }}>ดู →</button>
                        <button className="btn btn-del" onClick={() => setDeleteTarget(v)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {detail && (
        <div className="panel" onClick={e => e.target===e.currentTarget && setDetail(null)}>
          <div className="panel-box">
            <div className="panel-head">
              <div><div style={{ fontWeight:700, fontSize:16 }}>รายละเอียดคำร้อง</div><div style={{ fontSize:11.5, color:"var(--t3)", fontFamily:"'DM Mono',monospace", marginTop:3 }}>{detail.id}</div></div>
              <button className="btn btn-gh" onClick={() => setDetail(null)} style={{ padding:"4px 10px", fontSize:16 }}>✕</button>
            </div>
            <div className="panel-body" style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                ["👷 ผู้ร้องขอ", `${detail.requesterName} (${detail.employeeId})`],
                ["🏭 แผนก", detail.department],
                ["📧 อีเมลหัวหน้า", detail.supervisorEmail],
                ["🏢 บริษัทผู้เข้าเยี่ยม", detail.company],
                ["👥 จำนวนคน", `${detail.visitorCount} คน`],
                ["🎯 วัตถุประสงค์", detail.purpose],
                ["📍 พื้นที่", detail.area],
                ["📅 วันที่", `${detail.dateFrom}${detail.dateTo&&detail.dateTo!==detail.dateFrom?" ถึง "+detail.dateTo:""}`],
                ["🕐 เวลา", `${detail.enterTime} – ${detail.exitTime}`],
                ["📤 ส่งเมื่อ", thaiDate(detail.submittedAt)],
                ...(detail.approveNote?[["📝 หมายเหตุ",detail.approveNote]]:[]),
                ...(detail.approvedAt?[["🕐 พิจารณาเมื่อ",thaiDate(detail.approvedAt)]]:[]),
              ].map(([l,v]) => (
                <div key={l} style={{ display:"flex", gap:12 }}><div style={{ fontSize:12, color:"var(--t3)", width:180, flexShrink:0 }}>{l}</div><div style={{ fontSize:13, fontWeight:500 }}>{v}</div></div>
              ))}
              {detail.visitorNames?.length > 0 && (
                <div>
                  <div style={{ fontSize:12, color:"var(--t3)", marginBottom:8 }}>📋 รายชื่อผู้เข้าเยี่ยม</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {detail.visitorNames.map((n,i) => (
                      <div key={i} className="name-row">
                        <span className="name-idx">{i+1}.</span>
                        <span style={{ fontSize:13 }}>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="divider" style={{ margin:"4px 0" }}/>
              <div style={{ display:"flex", justifyContent:"center" }}><span className="badge" style={{ color:STATUS[detail.status]?.color, background:STATUS[detail.status]?.bg, fontSize:13, padding:"6px 18px" }}>{STATUS[detail.status]?.label}</span></div>
            </div>
            <div className="panel-foot" style={{ justifyContent:"space-between" }}>
              <button className="btn btn-del" onClick={() => { setDeleteTarget(detail); setDetail(null); }}>🗑️ ลบข้อมูลนี้</button>
              <button className="btn btn-s" onClick={() => setDetail(null)}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="panel" onClick={e => e.target===e.currentTarget && !deleting && setDeleteTarget(null)}>
          <div className="panel-box" style={{ maxWidth:440 }}>
            <div className="panel-head">
              <div style={{ fontWeight:700, fontSize:16 }}>🗑️ ยืนยันการลบ</div>
              <button className="btn btn-gh" onClick={() => !deleting && setDeleteTarget(null)} style={{ padding:"4px 10px", fontSize:16 }}>✕</button>
            </div>
            <div className="panel-body">
              <div className="danger-box" style={{ marginBottom:16 }}>
                <p style={{ fontSize:13.5, fontWeight:600, marginBottom:4 }}>{deleteTarget.company}</p>
                <p style={{ fontSize:12.5, color:"var(--t2)" }}>{deleteTarget.visitorCount} คน · {deleteTarget.dateFrom}</p>
                <p style={{ fontSize:12.5, color:"var(--t2)" }}>ผู้ร้องขอ: {deleteTarget.requesterName} ({deleteTarget.department})</p>
              </div>
              <p style={{ fontSize:13, color:"var(--t3)" }}>ข้อมูลนี้จะถูกลบออกจาก Google Sheets ถาวร ไม่สามารถกู้คืนได้</p>
            </div>
            <div className="panel-foot">
              <button className="btn btn-gh" onClick={() => !deleting && setDeleteTarget(null)} disabled={deleting}>ยกเลิก</button>
              <button className="btn btn-ng" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><div className="loader-spin"/> กำลังลบ...</> : "🗑️ ยืนยันลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Employee Form ────────────────────────────────────────────────────────────
function EmployeeForm({ onSubmit }) {
  const blank = {
    requesterName:"", employeeId:"", department:"", supervisorEmail:"",
    company:"", visitorCount:1, visitorNames:[""],
    purpose:"", area:"", dateFrom:"", dateTo:"", enterTime:"", exitTime:"",
  };
  const [f,    setF]    = useState(blank);
  const [err,  setErr]  = useState({});
  const [done, setDone] = useState(null);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  // เปลี่ยนจำนวนคน → ปรับ array ชื่อ
  const setCount = (n) => {
    const count = Math.max(1, Math.min(50, n));
    setF(p => {
      const names = [...p.visitorNames];
      while (names.length < count) names.push("");
      return { ...p, visitorCount: count, visitorNames: names.slice(0, count) };
    });
  };

  const setName = (i, val) => {
    setF(p => {
      const names = [...p.visitorNames];
      names[i] = val;
      return { ...p, visitorNames: names };
    });
  };

  const validate = () => {
    const e = {};
    if (!f.requesterName.trim()) e.requesterName = "กรุณากรอกชื่อผู้ร้องขอ";
    if (!f.employeeId.trim())    e.employeeId    = "กรุณากรอกรหัสพนักงาน";
    if (!f.department.trim())    e.department    = "กรุณากรอกแผนก";
    if (!f.supervisorEmail.trim()||!f.supervisorEmail.includes("@")) e.supervisorEmail = "อีเมลไม่ถูกต้อง";
    if (!f.company.trim())       e.company       = "กรุณากรอกชื่อบริษัท";
    if (f.visitorNames.some(n => !n.trim())) e.visitorNames = "กรุณากรอกชื่อให้ครบทุกคน";
    if (!f.purpose.trim())       e.purpose       = "กรุณากรอกวัตถุประสงค์";
    if (!f.area.trim())          e.area          = "กรุณากรอกพื้นที่";
    if (!f.dateFrom)             e.dateFrom      = "กรุณาเลือกวันที่เริ่ม";
    if (!f.enterTime)            e.enterTime     = "กรุณาระบุเวลาเข้า";
    if (!f.exitTime)             e.exitTime      = "กรุณาระบุเวลาออก";
    return e;
  };

  const submit = () => {
    const e = validate();
    setErr(e);
    if (Object.keys(e).length) return;
    const token = genToken();
    const v = { id:genId(), token, ...f, status:"pending", submittedAt:now() };
    onSubmit(v);
    setDone(v);
    setF(blank);
    setErr({});
  };

  if (done) return (
    <div className="fu" style={{ maxWidth:520, margin:"0 auto", textAlign:"center", padding:"60px 20px" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>📤</div>
      <h2 style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>ส่งคำร้องขอสำเร็จ!</h2>
      <p style={{ color:"var(--t2)", marginBottom:6 }}>รหัสคำร้อง: <span style={{ fontFamily:"'DM Mono',monospace", color:"var(--ac)", fontSize:16, fontWeight:600 }}>{done.id}</span></p>
      <p style={{ color:"var(--t2)", fontSize:13, marginBottom:28 }}>อีเมลแจ้งหัวหน้าถูกส่งไปที่ <strong style={{ color:"var(--t1)" }}>{done.supervisorEmail}</strong> แล้ว</p>
      <button className="btn btn-p" onClick={() => setDone(null)}>+ ส่งคำร้องใหม่</button>
    </div>
  );

  return (
    <div className="fu" style={{ maxWidth:720, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, borderRadius:14, marginBottom:14, background:"linear-gradient(135deg,rgba(0,217,176,.15),rgba(14,165,233,.15))", border:"1px solid rgba(0,217,176,.4)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h1 style={{ fontSize:21, fontWeight:700, marginBottom:5 }}>External Visitor Registration</h1>
        <p style={{ color:"var(--t2)", fontSize:13.5 }}>Please fill in the information to request approval for entering the factory area.</p>
      </div>

      {/* ── ผู้ร้องขอ (ขึ้นมาบน) ── */}
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <div className="sec-label">Requester Information</div>
        <div className="g2" style={{ marginBottom:14 }}>
          <Field label="Requester Name *" error={err.requesterName}>
            <input className={`inp${err.requesterName?" err":""}`} placeholder="Employee Name" value={f.requesterName} onChange={set("requesterName")}/>
          </Field>
          <Field label="ID Employee *" error={err.employeeId}>
            <input className={`inp${err.employeeId?" err":""}`} placeholder="e.g., AFBT00543" value={f.employeeId} onChange={set("employeeId")}/>
          </Field>
        </div>
        <div className="g2">
          <Field label="Department *" error={err.department}>
            <input className={`inp${err.department?" err":""}`} placeholder="e.g., Seal Plate, QC, HR, etc." value={f.department} onChange={set("department")}/>
          </Field>
          <Field label="Manager Email (for Approval) *" error={err.supervisorEmail}>
            <input type="email" className={`inp${err.supervisorEmail?" err":""}`} placeholder="manager@akitafb.co.th" value={f.supervisorEmail} onChange={set("supervisorEmail")}/>
          </Field>
        </div>
      </div>

      {/* ── บุคคลภายนอก ── */}
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <div className="sec-label">External Company / Visitor Information</div>

        <div className="g2" style={{ marginBottom:14 }}>
          <Field label="Company Name *" error={err.company}>
            <input className={`inp${err.company?" err":""}`} placeholder="Company / Organization Name" value={f.company} onChange={set("company")}/>
          </Field>
          <Field label="Number of Visitors *">
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div className="counter-ctrl">
                <button className="counter-btn" onClick={() => setCount(f.visitorCount - 1)}>−</button>
                <div className="counter-val">{f.visitorCount}</div>
                <button className="counter-btn" onClick={() => setCount(f.visitorCount + 1)}>+</button>
              </div>
              <span style={{ fontSize:13, color:"var(--t2)" }}>Persons</span>
            </div>
          </Field>
        </div>

        {/* ชื่อแต่ละคน */}
        <Field label={`Visitor Name(s) (${f.visitorCount} Persons) *`} error={err.visitorNames}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {f.visitorNames.map((name, i) => (
              <div key={i} className="name-row">
                <span className="name-idx">{i+1}.</span>
                <input
                  className={`inp${err.visitorNames?" err":""}`}
                  style={{ border:"none", background:"transparent", padding:"2px 0", fontSize:13.5, flex:1 }}
                  placeholder={`Name – Person ${i+1}`}
                  value={name}
                  onChange={e => setName(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </Field>

        <div style={{ marginTop:14 }}>
          <Field label="Purpose of Visit *" error={err.purpose}>
            <textarea className={`inp${err.purpose?" err":""}`} placeholder="e.g., machine/equipment repair, inspection, sorting, etc." value={f.purpose} onChange={set("purpose")}/>
          </Field>
        </div>

        <div style={{ marginTop:14 }}>
          <Field label="Area to Visit *" error={err.area}>
            <input className={`inp${err.area?" err":""}`} placeholder="e.g., Seal Plate Line, Assy Line, Machine No. M-056, etc." value={f.area} onChange={set("area")}/>
          </Field>
        </div>

        <div className="g2" style={{ marginTop:14 }}>
          <Field label="Start Date *" error={err.dateFrom}>
            <input type="date" className={`inp${err.dateFrom?" err":""}`} value={f.dateFrom} onChange={set("dateFrom")}/>
          </Field>
          <Field label="End Date" hint="(If more than 1 day)">
            <input type="date" className="inp" value={f.dateTo} min={f.dateFrom} onChange={set("dateTo")}/>
          </Field>
        </div>

        <div className="g2" style={{ marginTop:14 }}>
          <Field label="Time In *" error={err.enterTime}>
            <input type="time" className={`inp${err.enterTime?" err":""}`} value={f.enterTime} onChange={set("enterTime")}/>
          </Field>
          <Field label="Time Out *" error={err.exitTime}>
            <input type="time" className={`inp${err.exitTime?" err":""}`} value={f.exitTime} onChange={set("exitTime")}/>
          </Field>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button className="btn btn-p" onClick={submit} style={{ minWidth:170 }}>Submit Request</button>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,           setTab]          = useState("form");
  const [visitors,      setVisitors]     = useState([]);
  const [toasts,        setToasts]       = useState([]);
  const [adminLoggedIn, setAdminLoggedIn]= useState(false);
  const [adminPassword, setAdminPassword]= useState("");
  const [adminVisitors, setAdminVisitors]= useState([]);

  const params        = new URLSearchParams(window.location.search);
  const isApproveLink = params.get('id') && params.get('token');
  const isAdminLink   = params.get('admin') === '1';

  useEffect(() => {
    setVisitors(loadVisitors());
    if (loadAdminSession()) setAdminLoggedIn(true);
    if (isAdminLink) setTab("admin");
  }, []);

  const toast = (msg, type="ok") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id!==id)), 3800);
  };

  const handleSubmit = (v) => {
    const next = [v, ...visitors];
    setVisitors(next); saveVisitors(next);
    sendToGAS({ action:'submit', visitor:v });
    toast(`✅ ส่งคำร้องสำเร็จ รหัส: ${v.id}`);
  };

  const handleApprove = (id, note) => {
    const next = visitors.map(v => v.id===id ? { ...v, status:"approved", approveNote:note, approvedAt:now() } : v);
    setVisitors(next); saveVisitors(next);
    sendToGAS({ action:'approve', id, note });
  };

  const handleReject = (id, note) => {
    const next = visitors.map(v => v.id===id ? { ...v, status:"rejected", approveNote:note, approvedAt:now() } : v);
    setVisitors(next); saveVisitors(next);
    sendToGAS({ action:'reject', id, note });
  };

  const handleAdminLogin = (password, visitors) => {
    setAdminPassword(password);
    setAdminVisitors(visitors);
    setAdminLoggedIn(true);
    saveAdminSession(true);
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setAdminPassword("");
    saveAdminSession(false);
  };

  if (isApproveLink) return (
    <><G/>
      <TokenApprovePage visitors={visitors} onApprove={handleApprove} onReject={handleReject}/>
      <Toast items={toasts} remove={id => setToasts(p => p.filter(t => t.id!==id))}/>
    </>
  );

  if (tab === "admin") return (
    <><G/>
      <div style={{ minHeight:"100vh" }}>
        <header style={{ background:"var(--s1)", borderBottom:"1px solid var(--br)", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", gap:6, height:58 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <img src={LOGO_B64} alt="logo" style={{ height:34, width:"auto", objectFit:"contain" }}/>
                <span style={{ fontWeight:800, fontSize:15, color:"var(--t1)" }}>VisitorPass</span>
              </div>
              <span style={{ fontSize:13.5, fontWeight:600, color:"var(--t2)" }}>{COMPANY_NAME}</span>
            </div>
            </div>
            <button className="btn btn-gh" onClick={() => setTab("form")} style={{ fontSize:13 }}>← กลับหน้าหลัก</button>
          </div>
        </header>
        {adminLoggedIn
          ? <AdminDashboard password={adminPassword} initialVisitors={adminVisitors} onLogout={handleAdminLogout} toast={toast}/>
          : <AdminLogin onLogin={handleAdminLogin}/>
        }
      </div>
      <Toast items={toasts} remove={id => setToasts(p => p.filter(t => t.id!==id))}/>
    </>
  );

  return (
    <><G/>
      <div style={{ minHeight:"100vh" }}>
        <header style={{ background:"var(--s1)", borderBottom:"1px solid var(--br)", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", height:58 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src={LOGO_B64} alt="logo" style={{ height:34, width:"auto", objectFit:"contain" }}/>
            <span style={{ fontWeight:800, fontSize:15, color:"var(--t1)" }}>VisitorPass</span>
  </div>
  <span style={{ fontSize:13.5, fontWeight:600, color:"var(--t2)" }}>{COMPANY_NAME}</span>
</div>
            </div>
          </div>
        </header>
        <main style={{ maxWidth:1100, margin:"0 auto", padding:"36px 24px 80px" }}>
          <EmployeeForm onSubmit={handleSubmit}/>
        </main>
        <footer style={{ borderTop:"1px solid var(--br)", background:"var(--s1)", padding:"11px 24px", textAlign:"center", fontSize:11.5, color:"var(--t3)" }}>
          VisitorPass · ระบบลงทะเบียนบุคคลภายนอก
        </footer>
      </div>
      <Toast items={toasts} remove={id => setToasts(p => p.filter(t => t.id!==id))}/>
    </>
  );
}
