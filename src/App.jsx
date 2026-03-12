import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "visitorpass-data-v1";
const ADMIN_SESSION_KEY = "visitorpass-admin-session";
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyUYYtv_EBVr10uiJ0RrNX5f7IzAEg0tdi15rv7y8Tu95nQ77Qf7-nQDJUmKoGgar8V/exec'; // ← ใส่ URL ของคุณ

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

const genId = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const genToken = () => Math.random().toString(36).slice(2, 18);
const now = () => new Date().toISOString();
const thaiDate = (iso) => iso ? new Date(iso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "-";

const STATUS = {
  pending:  { label: "รออนุมัติ",   color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  approved: { label: "อนุมัติแล้ว", color: "#10b981", bg: "rgba(16,185,129,.12)" },
  rejected: { label: "ปฏิเสธ",      color: "#ef4444", bg: "rgba(239,68,68,.12)"  },
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
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes prog{from{width:100%}to{width:0%}}
    .fu{animation:fadeUp .35s ease both}.fi{animation:fadeIn .25s ease both}
    .inp{width:100%;background:var(--s1);border:1.5px solid var(--br);border-radius:8px;color:var(--t1);font-family:inherit;font-size:13.5px;padding:10px 13px;outline:none;transition:border-color .2s,box-shadow .2s;}
    .inp:focus{border-color:var(--ac);box-shadow:0 0 0 3px rgba(0,217,176,.1)}
    .inp.err{border-color:var(--ae)}.inp::placeholder{color:var(--t3)}
    textarea.inp{resize:vertical;min-height:76px;line-height:1.6}
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
    .btn-gh{background:transparent;color:var(--t2);padding:8px 14px;font-size:13px}
    .btn-gh:hover{color:var(--t1);background:var(--s2)}
    .card{background:var(--s1);border:1px solid var(--br);border-radius:var(--r);box-shadow:var(--sh)}
    .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 11px;border-radius:20px;font-size:12px;font-weight:600;}
    .badge::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0}
    .tag{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:6px;font-size:11.5px;font-weight:500;background:var(--s3);color:var(--t2);border:1px solid var(--br);}
    .divider{height:1px;background:var(--br);margin:18px 0}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
    @media(max-width:580px){.g2,.g3{grid-template-columns:1fr}}
    .sec-label{font-size:10.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:var(--t3);display:flex;align-items:center;gap:8px;margin-bottom:14px;}
    .sec-label::before{content:'';width:3px;height:13px;background:var(--ac);border-radius:2px;display:block}
    .sec-label::after{content:'';flex:1;height:1px;background:var(--br)}
    .fld{display:flex;flex-direction:column;gap:5px}
    .fld-label{font-size:12.5px;font-weight:500;color:var(--t2)}
    .err-msg{font-size:11px;color:var(--ae)}
    table{width:100%;border-collapse:collapse}
    th{background:var(--s2);color:var(--t3);font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:10px 16px;text-align:left;}
    td{padding:12px 16px;border-bottom:1px solid var(--br);font-size:13px;vertical-align:middle}
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
    .panel-box{background:var(--s1);border:1px solid var(--br2);border-radius:14px;width:100%;max-width:520px;box-shadow:0 24px 64px rgba(0,0,0,.6);animation:fadeUp .28s ease;}
    .panel-head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--br);}
    .panel-body{padding:24px}.panel-foot{padding:16px 24px;border-top:1px solid var(--br);display:flex;justify-content:flex-end;gap:10px;}
    .toast{position:fixed;bottom:24px;right:24px;z-index:999;background:var(--s2);border:1px solid var(--br2);padding:14px 20px;border-radius:10px;font-size:13.5px;box-shadow:var(--sh);max-width:340px;animation:fadeUp .3s ease;display:flex;align-items:center;gap:10px;cursor:pointer;}
    .toast-ok{border-left:4px solid var(--ag)}.toast-er{border-left:4px solid var(--ae)}
    .progress-wrap{height:3px;background:var(--br);border-radius:2px;overflow:hidden;margin-top:8px}
    .progress-bar{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--ac),var(--ab));animation:prog 3.5s linear forwards}
    .approve-card{background:linear-gradient(135deg,rgba(0,217,176,.06),rgba(14,165,233,.06));border:1.5px solid rgba(0,217,176,.25);border-radius:14px;padding:28px;}
    .loader-spin{display:inline-block;width:18px;height:18px;border:2.5px solid rgba(255,255,255,.2);border-top-color:var(--ac);border-radius:50%;animation:spin .7s linear infinite;}
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

function Field({ label, error, children }) {
  return (
    <div className="fld">
      {label && <label className="fld-label">{label}</label>}
      {children}
      {error && <span className="err-msg">⚠ {error}</span>}
    </div>
  );
}

// ─── หน้า Token Approve (เข้าด้วยลิงก์ในเมลเท่านั้น) ─────────────────────────
function TokenApprovePage({ visitors, onApprove, onReject }) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const token = params.get('token');
  const visitor = visitors.find(v => v.id === id && v.token === token);
  const [panel, setPanel] = useState(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(null);

  if (!visitor) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:400 }} className="fu">
        <div style={{ fontSize:64, marginBottom:16 }}>🔒</div>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>ลิงก์ไม่ถูกต้องหรือหมดอายุ</h2>
        <p style={{ color:"var(--t2)", fontSize:13.5 }}>กรุณาติดต่อผู้ส่งคำร้อง</p>
      </div>
    </div>
  );

  if (visitor.status !== "pending" && !done) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:400 }} className="fu">
        <div style={{ fontSize:64, marginBottom:16 }}>{visitor.status==="approved"?"✅":"❌"}</div>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>{visitor.status==="approved"?"อนุมัติไปแล้ว":"ปฏิเสธไปแล้ว"}</h2>
        <p style={{ color:"var(--t2)", fontSize:13.5 }}>คำร้องนี้ได้รับการพิจารณาแล้ว</p>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:400 }} className="fu">
        <div style={{ fontSize:64, marginBottom:16 }}>{done==="approved"?"✅":"❌"}</div>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>{done==="approved"?"อนุมัติเรียบร้อยแล้ว":"ปฏิเสธเรียบร้อยแล้ว"}</h2>
        <p style={{ color:"var(--t2)", fontSize:13.5 }}>ปิดหน้าต่างนี้ได้เลยครับ</p>
      </div>
    </div>
  );

  const confirm = (action) => {
    if (action==="approved") onApprove(visitor.id, note);
    else onReject(visitor.id, note);
    setDone(action);
    setPanel(null);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:560 }} className="fu">
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:9, marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:9, fontSize:18, background:"linear-gradient(135deg,var(--ac),var(--ab))", display:"flex", alignItems:"center", justifyContent:"center" }}>🏭</div>
            <span style={{ fontWeight:800, fontSize:16 }}>VisitorPass</span>
          </div>
          <h1 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>คำร้องขอเข้าโรงงาน</h1>
          <p style={{ color:"var(--t2)", fontSize:13 }}>กรุณาพิจารณาคำร้องด้านล่าง</p>
        </div>
        <div className="approve-card" style={{ marginBottom:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 24px" }}>
            {[["👤 ผู้เข้าเยี่ยม",visitor.visitorName],["🏢 บริษัท",visitor.company],["🎯 วัตถุประสงค์",visitor.purpose],["📅 วันที่",visitor.visitDate],["🕐 เวลา",`${visitor.enterTime}${visitor.exitTime?" – "+visitor.exitTime:""}`],["👷 ผู้ร้องขอ",`${visitor.requesterName} (${visitor.employeeId})`],["🏭 แผนก",visitor.department],["📤 ส่งเมื่อ",thaiDate(visitor.submittedAt)]].map(([l,v]) => (
              <div key={l}><div style={{ fontSize:11, color:"var(--t3)", marginBottom:3 }}>{l}</div><div style={{ fontSize:13.5, fontWeight:600 }}>{v||"-"}</div></div>
            ))}
          </div>
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
                <p style={{ color:"var(--t2)", fontSize:13.5 }}>{visitor.visitorName} — {visitor.company}</p>
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
    </div>
  );
}

// ─── หน้า Admin Login ─────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchFromGAS({ action: 'getAll', password });
      if (res.success) {
        onLogin(password, res.visitors);
      } else {
        setError("รหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:380 }} className="fu">
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:64, height:64, borderRadius:16, marginBottom:16, background:"linear-gradient(135deg,rgba(0,217,176,.15),rgba(14,165,233,.15))", border:"1px solid rgba(0,217,176,.4)", fontSize:28 }}>🔐</div>
          <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Admin Dashboard</h1>
          <p style={{ color:"var(--t2)", fontSize:13.5 }}>ใส่รหัสผ่านเพื่อเข้าใช้งาน</p>
        </div>
        <div className="card" style={{ padding:28 }}>
          <Field label="รหัสผ่าน" error={error}>
            <input
              type="password"
              className={`inp${error?" err":""}`}
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key==="Enter" && login()}
              autoFocus
            />
          </Field>
          <button className="btn btn-p" onClick={login} disabled={loading||!password.trim()} style={{ width:"100%", justifyContent:"center", marginTop:16, fontSize:14 }}>
            {loading ? <><div className="loader-spin"/> กำลังตรวจสอบ...</> : "🔓 เข้าสู่ระบบ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── หน้า Admin Dashboard (ดูข้อมูลจาก Sheets) ───────────────────────────────
function AdminDashboard({ password, initialVisitors, onLogout }) {
  const [visitors, setVisitors] = useState(initialVisitors || []);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFromGAS({ action: 'getAll', password });
      if (res.success) {
        setVisitors(res.visitors);
        setLastUpdated(new Date());
      }
    } catch {}
    setLoading(false);
  }, [password]);

  useEffect(() => {
    // Auto refresh ทุก 60 วินาที
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const stats = {
    total:    visitors.length,
    pending:  visitors.filter(v => v.status==="pending").length,
    approved: visitors.filter(v => v.status==="approved").length,
    rejected: visitors.filter(v => v.status==="rejected").length,
  };

  const list = visitors.filter(v => {
    if (filter!=="all" && v.status!==filter) return false;
    const q = search.toLowerCase();
    return !q || [v.visitorName,v.company,v.department,v.requesterName].some(x => x?.toLowerCase().includes(q));
  });

  return (
    <div className="fu" style={{ maxWidth:1100, margin:"0 auto", padding:"36px 24px 80px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14, marginBottom:28 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>🔐 Admin Dashboard</h2>
          <p style={{ fontSize:12.5, color:"var(--t3)" }}>
            อัปเดตล่าสุด: {lastUpdated.toLocaleTimeString("th-TH")}
            {loading && <span style={{ marginLeft:8 }}><span className="loader-spin" style={{ width:12, height:12, borderWidth:2 }}/></span>}
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-s" onClick={refresh} disabled={loading} style={{ fontSize:13 }}>
            🔄 รีเฟรช
          </button>
          <button className="btn btn-gh" onClick={onLogout} style={{ fontSize:13, border:"1.5px solid var(--br2)", borderRadius:8 }}>
            🚪 ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[{n:stats.total,l:"ทั้งหมด",c:"var(--ab)"},{n:stats.pending,l:"รออนุมัติ",c:"var(--aw)"},{n:stats.approved,l:"อนุมัติแล้ว",c:"var(--ag)"},{n:stats.rejected,l:"ปฏิเสธ",c:"var(--ae)"}].map(s => (
          <div className="stat" key={s.l}><div className="stat-n" style={{ color:s.c }}>{s.n}</div><div className="stat-l">{s.l}</div></div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:14 }}>
        <input className="inp" placeholder="🔍 ค้นหา ชื่อ / บริษัท / แผนก / ผู้ร้องขอ..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:320 }}/>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[["all","ทั้งหมด"],["pending","รออนุมัติ"],["approved","อนุมัติ"],["rejected","ปฏิเสธ"]].map(([k,l]) => (
            <button key={k} className={`tab-btn${filter===k?" on":""}`} onClick={() => setFilter(k)} style={{ fontSize:12, padding:"7px 14px" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        {list.length===0 ? (
          <div className="empty">
            <div style={{ fontSize:44, marginBottom:12, opacity:.4 }}>📋</div>
            <p style={{ fontWeight:600, color:"var(--t2)" }}>ไม่พบข้อมูล</p>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table>
              <thead>
                <tr>
                  <th>รหัส</th><th>ผู้เข้าเยี่ยม</th><th>บริษัท</th>
                  <th>วันที่ / เวลา</th><th>ผู้ร้องขอ</th><th>แผนก</th><th>สถานะ</th><th></th>
                </tr>
              </thead>
              <tbody>
                {list.map(v => (
                  <tr key={v.id}>
                    <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:"var(--t3)" }}>{v.id}</span></td>
                    <td style={{ fontWeight:600 }}>{v.visitorName}</td>
                    <td style={{ color:"var(--t2)" }}>{v.company}</td>
                    <td>
                      <div style={{ fontSize:12.5 }}>{v.visitDate}</div>
                      <div style={{ fontSize:11.5, color:"var(--t3)" }}>{v.enterTime}{v.exitTime?` – ${v.exitTime}`:""}</div>
                    </td>
                    <td>
                      <div style={{ fontSize:12.5 }}>{v.requesterName}</div>
                      <div style={{ fontSize:11.5, color:"var(--t3)" }}>{v.employeeId}</div>
                    </td>
                    <td style={{ fontSize:12.5, color:"var(--t2)" }}>{v.department}</td>
                    <td><span className="badge" style={{ color:STATUS[v.status]?.color, background:STATUS[v.status]?.bg }}>{STATUS[v.status]?.label}</span></td>
                    <td><button className="btn btn-gh" onClick={() => setDetail(v)} style={{ fontSize:12, padding:"5px 12px" }}>ดู →</button></td>
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
          <div className="panel-box" style={{ maxWidth:540 }}>
            <div className="panel-head">
              <div><div style={{ fontWeight:700, fontSize:16 }}>รายละเอียดคำร้อง</div><div style={{ fontSize:11.5, color:"var(--t3)", fontFamily:"'DM Mono',monospace", marginTop:3 }}>{detail.id}</div></div>
              <button className="btn btn-gh" onClick={() => setDetail(null)} style={{ padding:"4px 10px", fontSize:16 }}>✕</button>
            </div>
            <div className="panel-body" style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["👤 ผู้เข้าเยี่ยม",detail.visitorName],["🏢 บริษัท",detail.company],["🎯 วัตถุประสงค์",detail.purpose],["📅 วันที่",detail.visitDate],["🕐 เวลา",`${detail.enterTime}${detail.exitTime?" – "+detail.exitTime:""}`],["👷 ผู้ร้องขอ",`${detail.requesterName} (${detail.employeeId})`],["🏭 แผนก",detail.department],["📧 อีเมลหัวหน้า",detail.supervisorEmail],["📤 ส่งเมื่อ",thaiDate(detail.submittedAt)],...(detail.approveNote?[["📝 หมายเหตุ",detail.approveNote]]:[]),...(detail.approvedAt?[["🕐 พิจารณาเมื่อ",thaiDate(detail.approvedAt)]]:[])].map(([l,v]) => (
                <div key={l} style={{ display:"flex", gap:12 }}><div style={{ fontSize:12, color:"var(--t3)", width:180, flexShrink:0 }}>{l}</div><div style={{ fontSize:13, fontWeight:500 }}>{v}</div></div>
              ))}
              <div className="divider" style={{ margin:"4px 0" }}/>
              <div style={{ display:"flex", justifyContent:"center" }}><span className="badge" style={{ color:STATUS[detail.status]?.color, background:STATUS[detail.status]?.bg, fontSize:13, padding:"6px 18px" }}>{STATUS[detail.status]?.label}</span></div>
            </div>
            <div className="panel-foot"><button className="btn btn-s" onClick={() => setDetail(null)}>ปิด</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ฟอร์มกรอกข้อมูล ─────────────────────────────────────────────────────────
function EmployeeForm({ onSubmit }) {
  const blank = { visitorName:"", company:"", purpose:"", visitDate:"", enterTime:"", exitTime:"", requesterName:"", department:"", employeeId:"", supervisorEmail:"" };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState({});
  const [done, setDone] = useState(null);
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!f.visitorName.trim())   e.visitorName   = "กรุณากรอกชื่อ-นามสกุล";
    if (!f.company.trim())       e.company       = "กรุณากรอกบริษัท";
    if (!f.purpose.trim())       e.purpose       = "กรุณากรอกวัตถุประสงค์";
    if (!f.visitDate)            e.visitDate     = "กรุณาเลือกวันที่";
    if (!f.enterTime)            e.enterTime     = "กรุณาระบุเวลาเข้า";
    if (!f.requesterName.trim()) e.requesterName = "กรุณากรอกชื่อผู้ร้องขอ";
    if (!f.department.trim())    e.department    = "กรุณากรอกแผนก";
    if (!f.employeeId.trim())    e.employeeId    = "กรุณากรอกรหัสพนักงาน";
    if (!f.supervisorEmail.trim()||!f.supervisorEmail.includes("@")) e.supervisorEmail = "อีเมลไม่ถูกต้อง";
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
    <div className="fu" style={{ maxWidth:700, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, borderRadius:14, marginBottom:14, background:"linear-gradient(135deg,rgba(0,217,176,.15),rgba(14,165,233,.15))", border:"1px solid rgba(0,217,176,.4)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h1 style={{ fontSize:21, fontWeight:700, marginBottom:5 }}>ลงทะเบียนบุคคลภายนอก</h1>
        <p style={{ color:"var(--t2)", fontSize:13.5 }}>กรอกข้อมูลเพื่อขออนุมัติการเข้าโรงงาน</p>
      </div>
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <div className="sec-label">ข้อมูลผู้เข้าเยี่ยม</div>
        <div className="g2" style={{ marginBottom:14 }}>
          <Field label="ชื่อ-นามสกุล *" error={err.visitorName}><input className={`inp${err.visitorName?" err":""}`} placeholder="ชื่อเต็มของผู้เข้าเยี่ยม" value={f.visitorName} onChange={set("visitorName")}/></Field>
          <Field label="บริษัท / องค์กร *" error={err.company}><input className={`inp${err.company?" err":""}`} placeholder="ชื่อบริษัทหรือหน่วยงาน" value={f.company} onChange={set("company")}/></Field>
        </div>
        <Field label="วัตถุประสงค์การเข้าพบ *" error={err.purpose}><textarea className={`inp${err.purpose?" err":""}`} placeholder="เช่น ประชุมติดตามงาน, ตรวจสอบ, ส่งของ..." value={f.purpose} onChange={set("purpose")}/></Field>
        <div className="g3" style={{ marginTop:14 }}>
          <Field label="วันที่เข้าพบ *" error={err.visitDate}><input type="date" className={`inp${err.visitDate?" err":""}`} value={f.visitDate} onChange={set("visitDate")}/></Field>
          <Field label="เวลาเข้า *" error={err.enterTime}><input type="time" className={`inp${err.enterTime?" err":""}`} value={f.enterTime} onChange={set("enterTime")}/></Field>
          <Field label="เวลาออก (ประมาณ)"><input type="time" className="inp" value={f.exitTime} onChange={set("exitTime")}/></Field>
        </div>
      </div>
      <div className="card" style={{ padding:24, marginBottom:24 }}>
        <div className="sec-label">ข้อมูลผู้ร้องขอ (พนักงาน)</div>
        <div className="g2" style={{ marginBottom:14 }}>
          <Field label="ชื่อ-นามสกุลผู้ร้องขอ *" error={err.requesterName}><input className={`inp${err.requesterName?" err":""}`} placeholder="ชื่อพนักงาน" value={f.requesterName} onChange={set("requesterName")}/></Field>
          <Field label="รหัสพนักงาน *" error={err.employeeId}><input className={`inp${err.employeeId?" err":""}`} placeholder="เช่น EMP-0042" value={f.employeeId} onChange={set("employeeId")}/></Field>
        </div>
        <div className="g2">
          <Field label="แผนก *" error={err.department}><input className={`inp${err.department?" err":""}`} placeholder="เช่น ฝ่ายผลิต, QC, Admin" value={f.department} onChange={set("department")}/></Field>
          <Field label="อีเมลหัวหน้า (เพื่อส่ง Approve) *" error={err.supervisorEmail}><input type="email" className={`inp${err.supervisorEmail?" err":""}`} placeholder="supervisor@company.com" value={f.supervisorEmail} onChange={set("supervisorEmail")}/></Field>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button className="btn btn-p" onClick={submit} style={{ minWidth:170 }}>📤 ส่งคำร้องขอ</button>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("form");
  const [visitors, setVisitors] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminVisitors, setAdminVisitors] = useState([]);

  const params = new URLSearchParams(window.location.search);
  const isApproveLink = params.get('id') && params.get('token');
  const isAdminLink = params.get('admin') === '1';

  useEffect(() => {
    setVisitors(loadVisitors());
    if (loadAdminSession()) setAdminLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isAdminLink) setTab("admin");
  }, [isAdminLink]);

  const toast = (msg, type="ok") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id!==id)), 3800);
  };

  const handleSubmit = (v) => {
    const next = [v, ...visitors];
    setVisitors(next);
    saveVisitors(next);
    sendToGAS({ action:'submit', visitor:v });
    toast(`✅ ส่งคำร้องสำเร็จ รหัส: ${v.id}`);
  };

  const handleApprove = (id, note) => {
    const next = visitors.map(v => v.id===id ? { ...v, status:"approved", approveNote:note, approvedAt:now() } : v);
    setVisitors(next);
    saveVisitors(next);
    sendToGAS({ action:'approve', id, note });
  };

  const handleReject = (id, note) => {
    const next = visitors.map(v => v.id===id ? { ...v, status:"rejected", approveNote:note, approvedAt:now() } : v);
    setVisitors(next);
    saveVisitors(next);
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
    setTab("form");
  };

  // หน้า Token Approve (เข้าด้วยลิงก์จากเมล)
  if (isApproveLink) return (
    <>
      <G/>
      <TokenApprovePage visitors={visitors} onApprove={handleApprove} onReject={handleReject}/>
      <Toast items={toasts} remove={id => setToasts(p => p.filter(t => t.id!==id))}/>
    </>
  );

  // หน้า Admin (เข้าด้วย ?admin=1)
  if (tab === "admin") return (
    <>
      <G/>
      <div style={{ minHeight:"100vh" }}>
        <header style={{ background:"var(--s1)", borderBottom:"1px solid var(--br)", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", gap:6, height:58 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginRight:14 }}>
              <div style={{ width:32, height:32, borderRadius:8, fontSize:17, background:"linear-gradient(135deg,var(--ac),var(--ab))", display:"flex", alignItems:"center", justifyContent:"center" }}>🏭</div>
              <span style={{ fontWeight:800, fontSize:15 }}>VisitorPass</span>
            </div>
            <button className="btn btn-gh" onClick={() => setTab("form")} style={{ fontSize:13 }}>← กลับหน้าหลัก</button>
          </div>
        </header>
        {adminLoggedIn
          ? <AdminDashboard password={adminPassword} initialVisitors={adminVisitors} onLogout={handleAdminLogout}/>
          : <AdminLogin onLogin={handleAdminLogin}/>
        }
      </div>
      <Toast items={toasts} remove={id => setToasts(p => p.filter(t => t.id!==id))}/>
    </>
  );

  // หน้าหลัก (พนักงานกรอกฟอร์ม)
  return (
    <>
      <G/>
      <div style={{ minHeight:"100vh" }}>
        <header style={{ background:"var(--s1)", borderBottom:"1px solid var(--br)", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ width:32, height:32, borderRadius:8, fontSize:17, background:"linear-gradient(135deg,var(--ac),var(--ab))", display:"flex", alignItems:"center", justifyContent:"center" }}>🏭</div>
              <span style={{ fontWeight:800, fontSize:15 }}>VisitorPass</span>
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
