import { useState, useEffect } from "react";

const STORAGE_KEY = "visitorpass-data-v1";
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzFSAw-vT0N3P4xt3xYuUvdO6qlldTZxw-9z83tXuq8-2KAOsep4Lxm-rUWIjztE1kjEw/exec'; // ← ใส่ URL ของคุณตรงนี้

function loadVisitors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveVisitors(v) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch {}
}

const genId = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const now = () => new Date().toISOString();
const thaiDate = (iso) => iso ? new Date(iso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "-";

const STATUS = {
  pending:  { label: "รออนุมัติ",   color: "#f59e0b", bg: "rgba(245,158,11,.12)"  },
  approved: { label: "อนุมัติแล้ว", color: "#10b981", bg: "rgba(16,185,129,.12)"  },
  rejected: { label: "ปฏิเสธ",      color: "#ef4444", bg: "rgba(239,68,68,.12)"   },
};

function sendToGAS(payload) {
  try {
    const url = GAS_URL + '?data=' + encodeURIComponent(JSON.stringify(payload));
    const img = document.createElement('img');
    img.src = url;
    img.style.display = 'none';
    document.body.appendChild(img);
    setTimeout(() => document.body.removeChild(img), 3000);
  } catch(e) { console.error('GAS error:', e); }
}

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
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:var(--bg)}
    ::-webkit-scrollbar-thumb{background:var(--br);border-radius:3px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes prog{from{width:100%}to{width:0%}}
    .fu{animation:fadeUp .35s ease both}
    .fi{animation:fadeIn .25s ease both}
    .inp{width:100%;background:var(--s1);border:1.5px solid var(--br);border-radius:8px;color:var(--t1);font-family:inherit;font-size:13.5px;padding:10px 13px;outline:none;transition:border-color .2s,box-shadow .2s;}
    .inp:focus{border-color:var(--ac);box-shadow:0 0 0 3px rgba(0,217,176,.1)}
    .inp.err{border-color:var(--ae)}
    .inp::placeholder{color:var(--t3)}
    textarea.inp{resize:vertical;min-height:76px;line-height:1.6}
    .btn{display:inline-flex;align-items:center;gap:7px;border:none;cursor:pointer;font-family:inherit;font-weight:600;border-radius:8px;transition:all .18s;font-size:13.5px;}
    .btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
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
    .loader{display:inline-block;width:16px;height:16px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
    .empty{text-align:center;padding:56px 20px;color:var(--t3)}
    .panel{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
    .panel-box{background:var(--s1);border:1px solid var(--br2);border-radius:14px;width:100%;max-width:520px;box-shadow:0 24px 64px rgba(0,0,0,.6);animation:fadeUp .28s ease;}
    .panel-head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--br);}
    .panel-body{padding:24px}
    .panel-foot{padding:16px 24px;border-top:1px solid var(--br);display:flex;justify-content:flex-end;gap:10px;}
    .toast{position:fixed;bottom:24px;right:24px;z-index:999;background:var(--s2);border:1px solid var(--br2);padding:14px 20px;border-radius:10px;font-size:13.5px;box-shadow:var(--sh);max-width:340px;animation:fadeUp .3s ease;display:flex;align-items:center;gap:10px;cursor:pointer;}
    .toast-ok{border-left:4px solid var(--ag)}
    .toast-er{border-left:4px solid var(--ae)}
    .progress-wrap{height:3px;background:var(--br);border-radius:2px;overflow:hidden;margin-top:8px}
    .progress-bar{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--ac),var(--ab));animation:prog 3.5s linear forwards}
  `}</style>
);

function Toast({ items, remove }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:999, display:"flex", flexDirection:"column", gap:10 }}>
      {items.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
          <span style={{ fontSize:18 }}>{t.type==="ok" ? "✅" : "❌"}</span>
          <div>
            <div>{t.msg}</div>
            <div className="progress-wrap"><div className="progress-bar"/></div>
          </div>
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
    if (!f.supervisorEmail.trim() || !f.supervisorEmail.includes("@")) e.supervisorEmail = "อีเมลไม่ถูกต้อง";
    return e;
  };

  const submit = () => {
    const e = validate();
    setErr(e);
    if (Object.keys(e).length) return;
    const v = { id: genId(), ...f, status: "pending", submittedAt: now() };
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

function ManagerView({ visitors, onApprove, onReject }) {
  const [panel, setPanel] = useState(null);
  const [note, setNote] = useState("");
  const pending = visitors.filter(v => v.status === "pending");
  const openPanel = (visitor, action) => { setPanel({ visitor, action }); setNote(""); };
  const closePanel = () => { setPanel(null); setNote(""); };
  const confirm = () => {
    if (panel.action === "approve") onApprove(panel.visitor.id, note);
    else onReject(panel.visitor.id, note);
    closePanel();
  };

  return (
    <div className="fu" style={{ maxWidth:880, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:"linear-gradient(135deg,rgba(245,158,11,.15),rgba(239,68,68,.15))", border:"1px solid rgba(245,158,11,.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔑</div>
        <div>
          <h2 style={{ fontSize:18, fontWeight:700 }}>หน้า Approve ของหัวหน้า</h2>
          <p style={{ fontSize:13, color:"var(--t2)", marginTop:2 }}>{pending.length === 0 ? "ไม่มีรายการรออนุมัติ" : `${pending.length} รายการรอการพิจารณา`}</p>
        </div>
      </div>
      {pending.length === 0 ? (
        <div className="card"><div className="empty"><div style={{ fontSize:44, marginBottom:12, opacity:.4 }}>🎉</div><p style={{ fontWeight:600, fontSize:15, color:"var(--t2)" }}>ไม่มีรายการรออนุมัติ</p></div></div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {pending.map((v, i) => (
            <div key={v.id} className="card fu" style={{ padding:22, animationDelay:`${i*55}ms` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
                <div style={{ display:"flex", gap:12, flex:1 }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:"var(--s2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>👤</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                      <span style={{ fontWeight:700, fontSize:15 }}>{v.visitorName}</span>
                      <span className="tag">{v.company}</span>
                      <span className="badge" style={{ color:STATUS.pending.color, background:STATUS.pending.bg }}>{STATUS.pending.label}</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"8px 18px", marginTop:10 }}>
                      {[["🎯","วัตถุประสงค์",v.purpose],["📅","วันที่",v.visitDate],["🕐","เวลา",`${v.enterTime}${v.exitTime?" – "+v.exitTime:""}`],["👷","ผู้ร้องขอ",`${v.requesterName} (${v.employeeId})`],["🏢","แผนก",v.department],["📨","ส่งเมื่อ",thaiDate(v.submittedAt)]].map(([ic,lbl,val]) => (
                        <div key={lbl}><div style={{ fontSize:10.5, color:"var(--t3)", marginBottom:2 }}>{ic} {lbl}</div><div style={{ fontSize:12.5, fontWeight:500 }}>{val||"-"}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button className="btn btn-ok" onClick={() => openPanel(v,"approve")} style={{ fontSize:12.5, padding:"8px 16px" }}>✅ อนุมัติ</button>
                  <button className="btn btn-ng" onClick={() => openPanel(v,"reject")} style={{ fontSize:12.5, padding:"8px 16px" }}>❌ ปฏิเสธ</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {panel && (
        <div className="panel" onClick={e => e.target===e.currentTarget && closePanel()}>
          <div className="panel-box">
            <div className="panel-head">
              <div><div style={{ fontWeight:700, fontSize:16 }}>{panel.action==="approve" ? "✅ ยืนยันการอนุมัติ" : "❌ ยืนยันการปฏิเสธ"}</div><div style={{ fontSize:12, color:"var(--t2)", marginTop:3 }}>{panel.visitor.visitorName} — {panel.visitor.company}</div></div>
              <button className="btn btn-gh" onClick={closePanel} style={{ padding:"4px 10px", fontSize:16 }}>✕</button>
            </div>
            <div className="panel-body"><Field label="หมายเหตุ (ถ้ามี)"><textarea className="inp" placeholder="ระบุเหตุผลหรือเงื่อนไข..." value={note} onChange={e => setNote(e.target.value)} style={{ minHeight:88 }}/></Field></div>
            <div className="panel-foot">
              <button className="btn btn-gh" onClick={closePanel}>ยกเลิก</button>
              <button className={`btn ${panel.action==="approve" ? "btn-ok" : "btn-ng"}`} onClick={confirm}>{panel.action==="approve" ? "✅ ยืนยันอนุมัติ" : "❌ ยืนยันปฏิเสธ"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ visitors }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [detail, setDetail] = useState(null);
  const stats = { total:visitors.length, pending:visitors.filter(v=>v.status==="pending").length, approved:visitors.filter(v=>v.status==="approved").length, rejected:visitors.filter(v=>v.status==="rejected").length };
  const today = new Date().toISOString().slice(0,10);
  const todayApproved = visitors.filter(v => v.visitDate===today && v.status==="approved");
  const list = visitors.filter(v => {
    if (filter!=="all" && v.status!==filter) return false;
    const q = search.toLowerCase();
    return !q || [v.visitorName,v.company,v.department,v.requesterName].some(x => x?.toLowerCase().includes(q));
  });
  const emailPreview = `เรียน ผู้บริหาร\n\nรายงานบุคคลภายนอก วันที่ ${new Date().toLocaleDateString("th-TH",{dateStyle:"full"})}\n\n${todayApproved.length===0?"ไม่มีบุคคลภายนอกที่ได้รับอนุมัติให้เข้าพบในวันนี้":todayApproved.map((v,i)=>`${i+1}. ${v.visitorName} (${v.company})\n   แผนก: ${v.department} | ผู้ร้องขอ: ${v.requesterName} [${v.employeeId}]\n   เวลา: ${v.enterTime}${v.exitTime?" – "+v.exitTime:""}\n   วัตถุประสงค์: ${v.purpose}`).join("\n\n")}\n\nขอแสดงความนับถือ\nระบบ VisitorPass`;

  return (
    <div className="fu" style={{ maxWidth:1040, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14, marginBottom:28 }}>
        <div><h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Admin Dashboard</h2><p style={{ fontSize:13, color:"var(--t2)" }}>ภาพรวมบุคคลภายนอกทั้งหมด</p></div>
        <button className="btn btn-p" onClick={() => setShowEmail(!showEmail)} style={{ fontSize:13 }}>📧 ตัวอย่างอีเมลเช้า</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[{n:stats.total,l:"ทั้งหมด",c:"var(--ab)"},{n:stats.pending,l:"รออนุมัติ",c:"var(--aw)"},{n:stats.approved,l:"อนุมัติแล้ว",c:"var(--ag)"},{n:stats.rejected,l:"ปฏิเสธ",c:"var(--ae)"}].map(s => (
          <div className="stat" key={s.l}><div className="stat-n" style={{ color:s.c }}>{s.n}</div><div className="stat-l">{s.l}</div></div>
        ))}
      </div>
      {showEmail && (
        <div className="card fi" style={{ padding:20, marginBottom:20, borderColor:"rgba(14,165,233,.35)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontWeight:600, color:"var(--ab)", fontSize:13 }}>📧 ตัวอย่างอีเมลรายงานเช้า 7:00 น.</span>
            <button className="btn btn-gh" onClick={() => setShowEmail(false)} style={{ fontSize:12, padding:"4px 10px" }}>✕</button>
          </div>
          <pre style={{ background:"var(--bg)", border:"1px solid var(--br)", borderRadius:8, padding:16, fontSize:12.5, color:"var(--t2)", whiteSpace:"pre-wrap", fontFamily:"'DM Mono',monospace", lineHeight:1.75 }}>{emailPreview}</pre>
        </div>
      )}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:14 }}>
        <input className="inp" placeholder="🔍 ค้นหา ชื่อ / บริษัท / แผนก..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:280 }}/>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {[["all","ทั้งหมด"],["pending","รออนุมัติ"],["approved","อนุมัติ"],["rejected","ปฏิเสธ"]].map(([k,l]) => (
            <button key={k} className={`tab-btn${filter===k?" on":""}`} onClick={() => setFilter(k)} style={{ fontSize:12, padding:"7px 14px" }}>{l}</button>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        {list.length===0 ? <div className="empty"><p>ไม่พบข้อมูล</p></div> : (
          <div style={{ overflowX:"auto" }}>
            <table>
              <thead><tr><th>รหัส</th><th>ผู้เข้าเยี่ยม</th><th>บริษัท</th><th>วันที่ / เวลา</th><th>ผู้ร้องขอ</th><th>แผนก</th><th>สถานะ</th><th></th></tr></thead>
              <tbody>
                {list.map(v => (
                  <tr key={v.id}>
                    <td><span style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:"var(--t3)" }}>{v.id}</span></td>
                    <td style={{ fontWeight:600 }}>{v.visitorName}</td>
                    <td style={{ color:"var(--t2)" }}>{v.company}</td>
                    <td><div style={{ fontSize:12.5 }}>{v.visitDate}</div><div style={{ fontSize:11.5, color:"var(--t3)" }}>{v.enterTime}{v.exitTime?` – ${v.exitTime}`:""}</div></td>
                    <td><div style={{ fontSize:12.5 }}>{v.requesterName}</div><div style={{ fontSize:11.5, color:"var(--t3)" }}>{v.employeeId}</div></td>
                    <td style={{ fontSize:12.5, color:"var(--t2)" }}>{v.department}</td>
                    <td><span className="badge" style={{ color:STATUS[v.status].color, background:STATUS[v.status].bg }}>{STATUS[v.status].label}</span></td>
                    <td><button className="btn btn-gh" onClick={() => setDetail(v)} style={{ fontSize:12, padding:"5px 12px" }}>ดู →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {detail && (
        <div className="panel" onClick={e => e.target===e.currentTarget && setDetail(null)}>
          <div className="panel-box" style={{ maxWidth:540 }}>
            <div className="panel-head">
              <div><div style={{ fontWeight:700, fontSize:16 }}>รายละเอียดคำร้อง</div><div style={{ fontSize:11.5, color:"var(--t3)", fontFamily:"'DM Mono',monospace", marginTop:3 }}>{detail.id}</div></div>
              <button className="btn btn-gh" onClick={() => setDetail(null)} style={{ padding:"4px 10px", fontSize:16 }}>✕</button>
            </div>
            <div className="panel-body" style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["👤 ผู้เข้าเยี่ยม",detail.visitorName],["🏢 บริษัท",detail.company],["🎯 วัตถุประสงค์",detail.purpose],["📅 วันที่",detail.visitDate],["🕐 เวลา",`${detail.enterTime}${detail.exitTime?" – "+detail.exitTime:""}`],["👷 ผู้ร้องขอ",`${detail.requesterName} (${detail.employeeId})`],["🏭 แผนก",detail.department],["📧 อีเมลหัวหน้า",detail.supervisorEmail],["📤 ส่งเมื่อ",thaiDate(detail.submittedAt)],...(detail.approveNote?[["📝 หมายเหตุ",detail.approveNote]]:[])].map(([l,v]) => (
                <div key={l} style={{ display:"flex", gap:12 }}><div style={{ fontSize:12, color:"var(--t3)", width:180, flexShrink:0 }}>{l}</div><div style={{ fontSize:13, fontWeight:500 }}>{v}</div></div>
              ))}
              <div className="divider" style={{ margin:"4px 0" }}/>
              <div style={{ display:"flex", justifyContent:"center" }}><span className="badge" style={{ color:STATUS[detail.status].color, background:STATUS[detail.status].bg, fontSize:13, padding:"6px 18px" }}>{STATUS[detail.status].label}</span></div>
            </div>
            <div className="panel-foot"><button className="btn btn-s" onClick={() => setDetail(null)}>ปิด</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("form");
  const [visitors, setVisitors] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => { setVisitors(loadVisitors()); }, []);

  const toast = (msg, type="ok") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id!==id)), 3800);
  };

  const handleSubmit = (v) => {
    const next = [v, ...visitors];
    setVisitors(next);
    saveVisitors(next);
    sendToGAS({ action: 'submit', visitor: v });
    toast(`✅ ส่งคำร้องสำเร็จ รหัส: ${v.id}`);
  };

  const handleApprove = (id, note) => {
    const next = visitors.map(v => v.id===id ? { ...v, status:"approved", approveNote:note, approvedAt:now() } : v);
    setVisitors(next);
    saveVisitors(next);
    sendToGAS({ action: 'approve', id, note });
    toast("✅ อนุมัติเรียบร้อยแล้ว");
  };

  const handleReject = (id, note) => {
    const next = visitors.map(v => v.id===id ? { ...v, status:"rejected", approveNote:note, approvedAt:now() } : v);
    setVisitors(next);
    saveVisitors(next);
    sendToGAS({ action: 'reject', id, note });
    toast("❌ ปฏิเสธคำร้องแล้ว", "er");
  };

  const pending = visitors.filter(v => v.status==="pending").length;

  return (
    <>
      <G/>
      <iframe name="gas_iframe" style={{ display:"none" }} title="gas"/>
      <div style={{ minHeight:"100vh" }}>
        <header style={{ background:"var(--s1)", borderBottom:"1px solid var(--br)", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", gap:6, height:58 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginRight:14 }}>
              <div style={{ width:32, height:32, borderRadius:8, fontSize:17, background:"linear-gradient(135deg,var(--ac),var(--ab))", display:"flex", alignItems:"center", justifyContent:"center" }}>🏭</div>
              <span style={{ fontWeight:800, fontSize:15 }}>VisitorPass</span>
            </div>
            <nav style={{ display:"flex", gap:4, overflowX:"auto" }}>
              {[{id:"form",label:"📝 กรอกคำร้องขอ"},{id:"approve",label:`🔑 Approve${pending?` (${pending})`:""}`},{id:"admin",label:"📊 Dashboard"}].map(t => (
                <button key={t.id} className={`tab-btn${tab===t.id?" on":""}`} onClick={() => setTab(t.id)}>{t.label}</button>
              ))}
            </nav>
          </div>
        </header>
        <main style={{ maxWidth:1100, margin:"0 auto", padding:"36px 24px 80px" }}>
          {tab==="form"    && <EmployeeForm   onSubmit={handleSubmit}/>}
          {tab==="approve" && <ManagerView    visitors={visitors} onApprove={handleApprove} onReject={handleReject}/>}
          {tab==="admin"   && <AdminDashboard visitors={visitors}/>}
        </main>
        <footer style={{ borderTop:"1px solid var(--br)", background:"var(--s1)", padding:"11px 24px", textAlign:"center", fontSize:11.5, color:"var(--t3)" }}>
          VisitorPass · ข้อมูลบันทึกใน Browser (localStorage)
        </footer>
      </div>
      <Toast items={toasts} remove={id => setToasts(p => p.filter(t => t.id!==id))}/>
    </>
  );
}
