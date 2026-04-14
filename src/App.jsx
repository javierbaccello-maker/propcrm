import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const PORTALES = [
  { id: "mercadolibre", nombre: "Mercado Libre", color: "#FFE600" },
  { id: "zonaprop",     nombre: "Zona Prop",      color: "#E8323B" },
  { id: "argenprop",    nombre: "Argenprop",       color: "#1A56DB" },
  { id: "airbnb",       nombre: "Airbnb",          color: "#FF5A5F" },
  { id: "booking",      nombre: "Booking.com",     color: "#003580" },
];

const TIPOS = ["Departamento","Casa","PH","Local Comercial","Oficina","Terreno"];
const OPERACIONES = ["Venta","Alquiler","Alquiler Temporal"];

const estilos = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #f0f2f5; color: #333; }
  .btn { padding: 9px 18px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
  .btn-azul { background: #2563eb; color: white; }
  .btn-azul:hover { background: #1d4ed8; }
  .btn-azul:disabled { background: #93c5fd; cursor: not-allowed; }
  .btn-rojo { background: #dc2626; color: white; }
  .btn-gris { background: #e5e7eb; color: #374151; }
  .btn-verde { background: #16a34a; color: white; }
  .input { width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; }
  .input:focus { border-color: #2563eb; }
  .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px; }
  .tag { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; margin: 2px; }
  .modal-fondo { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .modal { background: white; border-radius: 12px; padding: 28px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; }
  .alerta { padding: 10px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 12px; }
  .alerta-ok { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .alerta-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
`;

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState("propiedades");
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const mostrarAviso = (msg, tipo) => {
    setAviso({ msg, tipo: tipo || "ok" });
    setTimeout(() => setAviso(null), 3000);
  };

  const cargarPropiedades = async () => {
    setCargando(true);
    const { data } = await supabase.from("propiedades").select("*").order("id", { ascending: false });
    if (data) setPropiedades(data.map(p => ({ ...p, portales: Array.isArray(p.portales) ? p.portales : [] })));
    setCargando(false);
  };

  useEffect(() => {
    if (usuario) cargarPropiedades();
  }, [usuario]);

  if (!usuario) {
    return (
      <>
        <style>{estilos}</style>
        <Login onLogin={setUsuario} />
      </>
    );
  }

  return (
    <>
      <style>{estilos}</style>

      {aviso && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999 }}>
          <div className={"alerta " + (aviso.tipo === "ok" ? "alerta-ok" : "alerta-error")}>{aviso.msg}</div>
        </div>
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>

        <aside style={{ width: 200, background: "#1e3a5f", color: "white", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 24, color: "#93c5fd" }}>PropCRM</div>
          {[
            ["propiedades", "Propiedades"],
            ["publicar", "Publicar"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setPagina(id)} style={{ background: pagina === id ? "#2563eb" : "transparent", color: "white", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 500 }}>
              {label}
            </button>
          ))}
          <div style={{ marginTop: "auto", borderTop: "1px solid #2d5a8e", paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 8 }}>Conectado como:</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{usuario.nombre}</div>
            <button onClick={() => setUsuario(null)} style={{ marginTop: 10, background: "transparent", color: "#93c5fd", border: "1px solid #2d5a8e", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, width: "100%" }}>
              Cerrar sesion
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: 28, overflow: "auto" }}>
          {pagina === "propiedades" && (
            <Propiedades propiedades={propiedades} recargar={cargarPropiedades} mostrarAviso={mostrarAviso} />
          )}
          {pagina === "publicar" && (
            <Publicar propiedades={propiedades} recargar={cargarPropiedades} mostrarAviso={mostrarAviso} />
          )}
        </main>

      </div>
    </>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const ingresar = async () => {
    if (!email || !pass) { setError("Completa todos los campos"); return; }
    setCargando(true);
    const { data } = await supabase.from("usuarios").select("*").eq("email", email.toLowerCase()).eq("password", pass).single();
    setCargando(false);
    if (!data) { setError("Email o contrasena incorrectos"); return; }
    if (!data.activo) { setError("Cuenta desactivada"); return; }
    onLogin(data);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: 40, borderRadius: 16, width: "100%", maxWidth: 400, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", color: "#1e3a5f", marginBottom: 6 }}>PropCRM</h1>
        <p style={{ color: "#6b7280", marginBottom: 28 }}>Sistema de gestion inmobiliaria</p>
        {error && <div className="alerta alerta-error" style={{ marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 5 }}>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@propcrm.com" onKeyDown={e => e.key === "Enter" && ingresar()} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 5 }}>Contrasena</label>
          <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && ingresar()} />
        </div>
        <button className="btn btn-azul" style={{ width: "100%", padding: 12, fontSize: 15 }} onClick={ingresar} disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
        <div style={{ marginTop: 20, padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Credenciales de prueba:</div>
          <div style={{ fontSize: 13, fontFamily: "monospace" }}>admin@propcrm.com</div>
          <div style={{ fontSize: 13, fontFamily: "monospace" }}>Admin2026!</div>
        </div>
      </div>
    </div>
  );
}

function Propiedades({ propiedades, recargar, mostrarAviso }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ titulo: "", tipo: "Departamento", operacion: "Alquiler", precio: "", moneda: "ARS", direccion: "", m2: "", ambientes: "", descripcion: "" });

  const abrirNueva = () => {
    setEditando(null);
    setForm({ titulo: "", tipo: "Departamento", operacion: "Alquiler", precio: "", moneda: "ARS", direccion: "", m2: "", ambientes: "", descripcion: "" });
    setModal(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({ titulo: p.titulo || "", tipo: p.tipo || "Departamento", operacion: p.operacion || "Alquiler", precio: p.precio || "", moneda: p.moneda || "ARS", direccion: p.direccion || "", m2: p.m2 || "", ambientes: p.ambientes || "", descripcion: p.descripcion || "" });
    setModal(true);
  };

  const guardar = async () => {
    if (!form.titulo) { alert("El titulo es obligatorio"); return; }
    setGuardando(true);
    const datos = { titulo: form.titulo, tipo: form.tipo, operacion: form.operacion, precio: Number(form.precio) || 0, moneda: form.moneda, direccion: form.direccion, m2: Number(form.m2) || 0, ambientes: Number(form.ambientes) || 0, descripcion: form.descripcion };
    if (editando) {
      await supabase.from("propiedades").update(datos).eq("id", editando.id);
      mostrarAviso("Propiedad actualizada");
    } else {
      await supabase.from("propiedades").insert([{ ...datos, portales: [], estado: "borrador" }]);
      mostrarAviso("Propiedad creada");
    }
    await recargar();
    setGuardando(false);
    setModal(false);
  };

  const eliminar = async (id) => {
    if (!window.confirm("Confirmas que queres eliminar esta propiedad?")) return;
    await supabase.from("propiedades").delete().eq("id", id);
    await recargar();
    mostrarAviso("Propiedad eliminada");
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#1e3a5f" }}>Propiedades</h2>
          <p style={{ color: "#6b7280", marginTop: 4 }}>{propiedades.length} propiedad(es) en tu cartera</p>
        </div>
        <button className="btn btn-azul" onClick={abrirNueva}>+ Nueva propiedad</button>
      </div>

      {propiedades.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
          <p style={{ fontSize: 16 }}>No hay propiedades todavia.</p>
          <p style={{ marginTop: 8 }}>Hace clic en "Nueva propiedad" para empezar.</p>
        </div>
      )}

      {propiedades.map(p => (
        <div key={p.id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{p.titulo}</h3>
                <span style={{ background: p.estado === "publicado" ? "#dcfce7" : "#fef9c3", color: p.estado === "publicado" ? "#166534" : "#854d0e", padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{p.estado || "borrador"}</span>
              </div>
              <div style={{ display: "flex", gap: 16, color: "#6b7280", fontSize: 13, marginBottom: 8, flexWrap: "wrap" }}>
                <span>{p.operacion}</span>
                <span>{p.tipo}</span>
                {p.m2 > 0 && <span>{p.m2} m2</span>}
                {p.ambientes > 0 && <span>{p.ambientes} ambientes</span>}
                {p.precio > 0 && <span style={{ color: "#2563eb", fontWeight: 600 }}>{p.moneda === "USD" ? "USD" : "$"} {p.precio.toLocaleString()}</span>}
              </div>
              {p.direccion && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>{p.direccion}</div>}
              <div>
                {(p.portales || []).length === 0 && <span style={{ fontSize: 12, color: "#9ca3af" }}>Sin publicar en portales</span>}
                {(p.portales || []).map(pid => {
                  const portal = PORTALES.find(x => x.id === pid);
                  return portal ? <span key={pid} className="tag" style={{ background: portal.color + "22", color: portal.color, border: "1px solid " + portal.color + "55" }}>{portal.nombre}</span> : null;
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
              <button className="btn btn-gris" onClick={() => abrirEditar(p)}>Editar</button>
              <button className="btn btn-rojo" onClick={() => eliminar(p.id)}>Borrar</button>
            </div>
          </div>
        </div>
      ))}

      {modal && (
        <div className="modal-fondo" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>{editando ? "Editar propiedad" : "Nueva propiedad"}</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, display: "block", marginBottom: 5 }}>Titulo *</label>
                <input className="input" value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ej: Departamento 2 ambientes en Palermo" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5 }}>Tipo</label>
                  <select className="input" value={form.tipo} onChange={e => set("tipo", e.target.value)}>{TIPOS.map(t => <option key={t}>{t}</option>)}</select>
                </div>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5 }}>Operacion</label>
                  <select className="input" value={form.operacion} onChange={e => set("operacion", e.target.value)}>{OPERACIONES.map(o => <option key={o}>{o}</option>)}</select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5 }}>Precio</label>
                  <input className="input" type="number" value={form.precio} onChange={e => set("precio", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5 }}>Moneda</label>
                  <select className="input" value={form.moneda} onChange={e => set("moneda", e.target.value)}><option value="ARS">ARS</option><option value="USD">USD</option></select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, display: "block", marginBottom: 5 }}>Direccion</label>
                <input className="input" value={form.direccion} onChange={e => set("direccion", e.target.value)} placeholder="Ej: Av. Santa Fe 1234, CABA" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5 }}>M2</label>
                  <input className="input" type="number" value={form.m2} onChange={e => set("m2", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5 }}>Ambientes</label>
                  <input className="input" type="number" value={form.ambientes} onChange={e => set("ambientes", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, display: "block", marginBottom: 5 }}>Descripcion</label>
                <textarea className="input" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} rows={3} style={{ resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button className="btn btn-azul" onClick={guardar} disabled={guardando}>{guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear propiedad"}</button>
              <button className="btn btn-gris" onClick={() => setModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Publicar({ propiedades, recargar, mostrarAviso }) {
  const [propSel, setPropSel] = useState(null);
  const [portalesSel, setPortalesSel] = useState([]);
  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    if (propSel) {
      const p = propiedades.find(x => x.id === propSel);
      setPortalesSel(p ? p.portales || [] : []);
    }
  }, [propSel]);

  const togglePortal = (id) => {
    setPortalesSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const publicar = async () => {
    if (!propSel || portalesSel.length === 0) return;
    setPublicando(true);
    await new Promise(r => setTimeout(r, 1500));
    const estado = portalesSel.length > 0 ? "publicado" : "borrador";
    await supabase.from("propiedades").update({ portales: portalesSel, estado: estado }).eq("id", propSel);
    await recargar();
    setPublicando(false);
    mostrarAviso("Publicado en " + portalesSel.length + " portal(es)");
  };

  const prop = propiedades.find(p => p.id === propSel);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#1e3a5f" }}>Publicacion Multi-Portal</h2>
        <p style={{ color: "#6b7280", marginTop: 4 }}>Selecciona una propiedad y los portales donde queres publicar</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 14, color: "#374151" }}>1. Elige la propiedad</h3>
          {propiedades.length === 0 && <div className="card" style={{ color: "#9ca3af", textAlign: "center", padding: 24 }}>No hay propiedades. Primero crea una.</div>}
          {propiedades.map(p => (
            <div key={p.id} onClick={() => setPropSel(p.id)} className="card" style={{ cursor: "pointer", border: propSel === p.id ? "2px solid #2563eb" : "1px solid #e5e7eb", background: propSel === p.id ? "#eff6ff" : "white", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.titulo}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{p.operacion} - {p.tipo}</div>
              {p.precio > 0 && <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, marginTop: 4 }}>{p.moneda === "USD" ? "USD" : "$"} {p.precio.toLocaleString()}</div>}
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 14, color: "#374151" }}>2. Elige los portales</h3>
          <div className="card" style={{ marginBottom: 16 }}>
            {PORTALES.map(p => (
              <div key={p.id} onClick={() => togglePortal(p.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color }} />
                  <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                </div>
                <div style={{ width: 22, height: 22, border: "2px solid " + (portalesSel.includes(p.id) ? "#2563eb" : "#d1d5db"), borderRadius: 4, background: portalesSel.includes(p.id) ? "#2563eb" : "white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: "bold" }}>
                  {portalesSel.includes(p.id) ? "v" : ""}
                </div>
              </div>
            ))}
          </div>

          {prop && (
            <div className="card" style={{ background: "#f8fafc", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>RESUMEN</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{prop.titulo}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{prop.operacion} - {prop.tipo}</div>
              {prop.precio > 0 && <div style={{ fontSize: 15, color: "#2563eb", fontWeight: 700, marginTop: 6 }}>{prop.moneda === "USD" ? "USD" : "$"} {prop.precio.toLocaleString()}</div>}
              <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>Se publicara en {portalesSel.length} portal(es)</div>
            </div>
          )}

          <button className="btn btn-azul" disabled={!propSel || portalesSel.length === 0 || publicando} onClick={publicar} style={{ width: "100%", padding: 13, fontSize: 15 }}>
            {publicando ? "Publicando..." : "Publicar en " + portalesSel.length + " portal(es)"}
          </button>
        </div>

      </div>
    </div>
  );
}
