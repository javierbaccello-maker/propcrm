import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const PORTALES = [
  { id: "mercadolibre", nombre: "Mercado Libre", color: "#FFE600", instrucciones: "1. Anda a developers.mercadolibre.com.ar\n2. Inicia sesion con tu cuenta de MercadoLibre\n3. Crea una aplicacion nueva\n4. En Scopes tilda items y pictures\n5. Copia el App ID y el Secret Key" },
  { id: "zonaprop",     nombre: "Zona Prop",      color: "#E8323B", instrucciones: "1. Llama a tu ejecutivo de cuenta de Zonaprop\n2. Pedi acceso a la API para integracion con software propio\n3. Te van a dar una API Key\n4. Pegala en el campo de abajo" },
  { id: "argenprop",    nombre: "Argenprop",       color: "#1A56DB", instrucciones: "1. Llama a tu ejecutivo de cuenta de Argenprop\n2. Pedi acceso a la API para integracion con software propio\n3. Te van a dar una API Key\n4. Pegala en el campo de abajo" },
  { id: "airbnb",       nombre: "Airbnb",          color: "#FF5A5F", instrucciones: "1. Anda a airbnb.com.ar con tu cuenta\n2. Ve a Herramientas para anfitriones\n3. Busca Software de gestion de propiedades\n4. Conecta un software externo y copia el token" },
  { id: "booking",      nombre: "Booking.com",     color: "#003580", instrucciones: "1. Ingresa a admin.booking.com\n2. Ve a Cuenta > Conectividad\n3. Busca Conectar con un proveedor de software\n4. Solicita acceso a la API y copia las credenciales" },
];

const TIPOS      = ["Departamento","Casa","PH","Local Comercial","Oficina","Terreno"];
const OPERACIONES = ["Venta","Alquiler","Alquiler Temporal"];

const estilos = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #f0f2f5; color: #333; }
  .btn { padding: 9px 18px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
  .btn-azul  { background: #2563eb; color: white; }
  .btn-azul:hover  { background: #1d4ed8; }
  .btn-azul:disabled { background: #93c5fd; cursor: not-allowed; }
  .btn-rojo  { background: #dc2626; color: white; }
  .btn-gris  { background: #e5e7eb; color: #374151; }
  .btn-verde { background: #16a34a; color: white; }
  .btn-verde:hover { background: #15803d; }
  .btn-sm    { padding: 6px 12px; font-size: 12px; }
  .input { width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; font-family: Arial, sans-serif; }
  .input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px #dbeafe; }
  .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px; }
  .tag { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; margin: 2px; }
  .modal-fondo { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .modal { background: white; border-radius: 12px; padding: 28px; max-width: 680px; width: 100%; max-height: 92vh; overflow-y: auto; }
  .alerta { padding: 10px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 12px; }
  .alerta-ok    { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .alerta-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
  .alerta-warn  { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .zona-fotos { border: 2px dashed #d1d5db; border-radius: 10px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
  .zona-fotos:hover { border-color: #2563eb; background: #eff6ff; }
  .foto-mini { width: 90px; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; }
  .foto-contenedor { position: relative; display: inline-block; margin: 4px; }
  .foto-borrar { position: absolute; top: -6px; right: -6px; background: #dc2626; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 13px; font-weight: bold; display: flex; align-items: center; justify-content: center; }
  .portal-card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px; transition: border-color 0.2s; }
  .portal-card.conectado { border-color: #86efac; background: #f0fdf4; }
  .toggle { width: 48px; height: 26px; border-radius: 13px; background: #d1d5db; position: relative; cursor: pointer; transition: background 0.2s; border: none; }
  .toggle.activo { background: #16a34a; }
  .toggle-circulo { width: 20px; height: 20px; border-radius: 50%; background: white; position: absolute; top: 3px; left: 3px; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .toggle.activo .toggle-circulo { left: 25px; }
  .nav-btn { background: transparent; color: #93c5fd; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; text-align: left; font-size: 14px; font-weight: 500; width: 100%; }
  .nav-btn:hover  { background: #1e4a7a; color: white; }
  .nav-btn.activo { background: #2563eb; color: white; }
  .barra-progreso { width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-top: 8px; }
  .barra-relleno  { height: 100%; background: #2563eb; border-radius: 3px; transition: width 0.3s; }
  .tab { padding: 8px 18px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; font-family: Arial, sans-serif; }
  .tab.activo { background: #2563eb; color: white; }
  .tab:not(.activo) { background: #f3f4f6; color: #6b7280; }
  .tab:not(.activo):hover { background: #e5e7eb; }
  .fila-tabla { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6; gap: 12px; }
  .fila-tabla:last-child { border-bottom: none; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  .badge-verde  { background: #dcfce7; color: #166534; }
  .badge-rojo   { background: #fee2e2; color: #991b1b; }
  .badge-amarillo { background: #fef9c3; color: #854d0e; }
  .badge-azul   { background: #dbeafe; color: #1e40af; }
  .badge-gris   { background: #f3f4f6; color: #6b7280; }
  .seccion-titulo { font-size: 16px; font-weight: 600; color: #1e3a5f; margin-bottom: 14px; }
  .contrato-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: all 0.15s; }
  .contrato-card:hover { border-color: #93c5fd; background: #f8fafc; }
  .contrato-card.seleccionado { border-color: #2563eb; background: #eff6ff; }
  .info-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
  .info-valor { font-size: 14px; color: #1f2937; font-weight: 500; }
`;

export default function App() {
  const [usuario,       setUsuario]       = useState(null);
  const [pagina,        setPagina]        = useState("propiedades");
  const [propiedades,   setPropiedades]   = useState([]);
  const [contratos,     setContratos]     = useState([]);
  const [portalesConfig,setPortalesConfig]= useState([]);
  const [aviso,         setAviso]         = useState(null);

  const mostrarAviso = (msg, tipo) => {
    setAviso({ msg, tipo: tipo || "ok" });
    setTimeout(() => setAviso(null), 3500);
  };

  const cargarDatos = async () => {
    const [rProps, rContratos, rPortales] = await Promise.all([
      supabase.from("propiedades").select("*").order("id", { ascending: false }),
      supabase.from("contratos").select("*").order("id", { ascending: false }),
      supabase.from("portal_config").select("*"),
    ]);
    if (rProps.data)    setPropiedades(rProps.data.map(p => ({ ...p, portales: Array.isArray(p.portales) ? p.portales : [], fotos: Array.isArray(p.fotos) ? p.fotos : [] })));
    if (rContratos.data) setContratos(rContratos.data.map(c => ({ ...c, pagos: Array.isArray(c.pagos) ? c.pagos : [], expensas: Array.isArray(c.expensas) ? c.expensas : [], reparaciones: Array.isArray(c.reparaciones) ? c.reparaciones : [], documentos: Array.isArray(c.documentos) ? c.documentos : [] })));
    if (rPortales.data) setPortalesConfig(rPortales.data);
  };

  useEffect(() => { if (usuario) cargarDatos(); }, [usuario]);

  if (!usuario) {
    return (
      <>
        <style>{estilos}</style>
        <Login onLogin={setUsuario} />
      </>
    );
  }

  const pagosPendientes = contratos.reduce((a, c) => a + c.pagos.filter(p => p.estado === "pendiente").length, 0);

  const MENU = [
    { id: "propiedades", label: "Propiedades" },
    { id: "publicar",    label: "Publicar" },
    { id: "alquileres",  label: "Alquileres", badge: pagosPendientes },
    { id: "portales",    label: "Portales" },
  ];

  return (
    <>
      <style>{estilos}</style>
      {aviso && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, minWidth: 260 }}>
          <div className={"alerta " + (aviso.tipo === "ok" ? "alerta-ok" : aviso.tipo === "warn" ? "alerta-warn" : "alerta-error")}>{aviso.msg}</div>
        </div>
      )}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: 210, background: "#1e3a5f", color: "white", padding: "24px 14px", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 24, color: "#93c5fd", paddingLeft: 4 }}>PropCRM</div>
          {MENU.map(m => (
            <button key={m.id} className={"nav-btn" + (pagina === m.id ? " activo" : "")} onClick={() => setPagina(m.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{m.label}</span>
              {m.badge > 0 && <span style={{ background: "#dc2626", color: "white", borderRadius: 10, fontSize: 11, padding: "1px 7px", fontWeight: 700 }}>{m.badge}</span>}
            </button>
          ))}
          <div style={{ marginTop: "auto", borderTop: "1px solid #2d5a8e", paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 6 }}>Conectado como:</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{usuario.nombre}</div>
            <button onClick={() => { setUsuario(null); setPropiedades([]); setContratos([]); setPortalesConfig([]); }} style={{ marginTop: 10, background: "transparent", color: "#93c5fd", border: "1px solid #2d5a8e", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, width: "100%" }}>
              Cerrar sesion
            </button>
          </div>
        </aside>
        <main style={{ flex: 1, padding: 28, overflow: "auto" }}>
          {pagina === "propiedades" && <Propiedades propiedades={propiedades} recargar={cargarDatos} mostrarAviso={mostrarAviso} />}
          {pagina === "publicar"    && <Publicar    propiedades={propiedades} portalesConfig={portalesConfig} recargar={cargarDatos} mostrarAviso={mostrarAviso} />}
          {pagina === "alquileres"  && <Alquileres  contratos={contratos} propiedades={propiedades} recargar={cargarDatos} mostrarAviso={mostrarAviso} />}
          {pagina === "portales"    && <Portales    portalesConfig={portalesConfig} recargar={cargarDatos} mostrarAviso={mostrarAviso} />}
        </main>
      </div>
    </>
  );
}

// LOGIN
function Login({ onLogin }) {
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [error,   setError]   = useState("");
  const [cargando,setCargando]= useState(false);

  const ingresar = async () => {
    if (!email || !pass) { setError("Completa todos los campos"); return; }
    setCargando(true);
    const { data } = await supabase.from("usuarios").select("*").eq("email", email.toLowerCase()).eq("password", pass).single();
    setCargando(false);
    if (!data)        { setError("Email o contrasena incorrectos"); return; }
    if (!data.activo) { setError("Cuenta desactivada");             return; }
    onLogin(data);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: 40, borderRadius: 16, width: "100%", maxWidth: 400, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold", color: "#1e3a5f", marginBottom: 6 }}>PropCRM</h1>
        <p style={{ color: "#6b7280", marginBottom: 28 }}>Sistema de gestion inmobiliaria</p>
        {error && <div className="alerta alerta-error">{error}</div>}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 5 }}>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@propcrm.com" onKeyDown={e => e.key === "Enter" && ingresar()} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 5 }}>Contrasena</label>
          <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && ingresar()} />
        </div>
        <button className="btn btn-azul" style={{ width: "100%", padding: 12, fontSize: 15, justifyContent: "center" }} onClick={ingresar} disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
        <div style={{ marginTop: 20, padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Credenciales:</div>
          <div style={{ fontSize: 13, fontFamily: "monospace" }}>admin@propcrm.com / Admin2026!</div>
        </div>
      </div>
    </div>
  );
}

// PROPIEDADES
function Propiedades({ propiedades, recargar, mostrarAviso }) {
  const [modal,    setModal]    = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando,setGuardando]= useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const inputFotoRef = useRef();
  const [form, setForm] = useState({ titulo: "", tipo: "Departamento", operacion: "Alquiler", precio: "", moneda: "ARS", direccion: "", m2: "", ambientes: "", descripcion: "", fotos: [] });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const abrirNueva = () => {
    setEditando(null);
    setForm({ titulo: "", tipo: "Departamento", operacion: "Alquiler", precio: "", moneda: "ARS", direccion: "", m2: "", ambientes: "", descripcion: "", fotos: [] });
    setModal(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({ titulo: p.titulo || "", tipo: p.tipo || "Departamento", operacion: p.operacion || "Alquiler", precio: p.precio || "", moneda: p.moneda || "ARS", direccion: p.direccion || "", m2: p.m2 || "", ambientes: p.ambientes || "", descripcion: p.descripcion || "", fotos: p.fotos || [] });
    setModal(true);
  };

  const subirFotos = async (archivos) => {
    const permitidos = Array.from(archivos).filter(f => f.type.startsWith("image/"));
    if (permitidos.length === 0) { mostrarAviso("Solo se permiten imagenes", "error"); return; }
    setSubiendo(true);
    const urlsNuevas = [];
    for (let i = 0; i < permitidos.length; i++) {
      const archivo = permitidos[i];
      if (archivo.size > 8 * 1024 * 1024) { mostrarAviso("La imagen supera 8MB", "error"); continue; }
      const nombre = Date.now() + "_" + archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const { data, error } = await supabase.storage.from("fotos").upload(nombre, archivo, { cacheControl: "3600", upsert: false });
      if (!error) {
        const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(nombre);
        urlsNuevas.push(urlData.publicUrl);
      }
      setProgreso(Math.round(((i + 1) / permitidos.length) * 100));
    }
    setForm(p => ({ ...p, fotos: [...p.fotos, ...urlsNuevas] }));
    setSubiendo(false);
    setProgreso(0);
    mostrarAviso(urlsNuevas.length + " foto(s) subida(s)");
  };

  const borrarFoto = async (url, index) => {
    const nombre = url.split("/fotos/")[1];
    if (nombre) await supabase.storage.from("fotos").remove([nombre]);
    setForm(p => ({ ...p, fotos: p.fotos.filter((_, i) => i !== index) }));
  };

  const guardar = async () => {
    if (!form.titulo) { mostrarAviso("El titulo es obligatorio", "error"); return; }
    setGuardando(true);
    const datos = { titulo: form.titulo, tipo: form.tipo, operacion: form.operacion, precio: Number(form.precio) || 0, moneda: form.moneda, direccion: form.direccion, m2: Number(form.m2) || 0, ambientes: Number(form.ambientes) || 0, descripcion: form.descripcion, fotos: form.fotos };
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#1e3a5f" }}>Propiedades</h2>
          <p style={{ color: "#6b7280", marginTop: 4 }}>{propiedades.length} propiedad(es)</p>
        </div>
        <button className="btn btn-azul" onClick={abrirNueva}>+ Nueva propiedad</button>
      </div>

      {propiedades.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
          <p>No hay propiedades todavia. Hace clic en "Nueva propiedad" para empezar.</p>
        </div>
      )}

      {propiedades.map(p => (
        <div key={p.id} className="card">
          <div style={{ display: "flex", gap: 16 }}>
            {(p.fotos || []).length > 0 && (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {p.fotos.slice(0, 3).map((url, i) => (
                  <img key={i} src={url} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
                ))}
                {p.fotos.length > 3 && (
                  <div style={{ width: 80, height: 80, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#6b7280", fontWeight: 600 }}>+{p.fotos.length - 3}</div>
                )}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{p.titulo}</h3>
                <span className={"badge " + (p.estado === "publicado" ? "badge-verde" : "badge-amarillo")}>{p.estado || "borrador"}</span>
                {(p.fotos || []).length > 0 && <span style={{ fontSize: 12, color: "#6b7280" }}>{p.fotos.length} foto(s)</span>}
              </div>
              <div style={{ display: "flex", gap: 16, color: "#6b7280", fontSize: 13, marginBottom: 8, flexWrap: "wrap" }}>
                <span>{p.operacion}</span>
                <span>{p.tipo}</span>
                {p.m2 > 0      && <span>{p.m2} m2</span>}
                {p.ambientes > 0 && <span>{p.ambientes} amb.</span>}
                {p.precio > 0  && <span style={{ color: "#2563eb", fontWeight: 600 }}>{p.moneda === "USD" ? "USD" : "$"} {p.precio.toLocaleString()}</span>}
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
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <button className="btn btn-gris" onClick={() => abrirEditar(p)}>Editar</button>
              <button className="btn btn-rojo" onClick={() => eliminar(p.id)}>Borrar</button>
            </div>
          </div>
        </div>
      ))}

      {modal && (
        <div className="modal-fondo" onClick={() => !subiendo && setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>{editando ? "Editar propiedad" : "Nueva propiedad"}</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Titulo *</label>
                <input className="input" value={form.titulo} onChange={e => set("titulo", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Tipo</label>
                  <select className="input" value={form.tipo} onChange={e => set("tipo", e.target.value)}>{TIPOS.map(t => <option key={t}>{t}</option>)}</select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Operacion</label>
                  <select className="input" value={form.operacion} onChange={e => set("operacion", e.target.value)}>{OPERACIONES.map(o => <option key={o}>{o}</option>)}</select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Precio</label>
                  <input className="input" type="number" value={form.precio} onChange={e => set("precio", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Moneda</label>
                  <select className="input" value={form.moneda} onChange={e => set("moneda", e.target.value)}><option value="ARS">ARS</option><option value="USD">USD</option></select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Direccion</label>
                <input className="input" value={form.direccion} onChange={e => set("direccion", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>M2</label>
                  <input className="input" type="number" value={form.m2} onChange={e => set("m2", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Ambientes</label>
                  <input className="input" type="number" value={form.ambientes} onChange={e => set("ambientes", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Descripcion</label>
                <textarea className="input" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} rows={3} style={{ resize: "vertical" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>Fotos</label>
                {(form.fotos || []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {form.fotos.map((url, i) => (
                      <div key={i} className="foto-contenedor">
                        <img src={url} alt="" className="foto-mini" />
                        <button className="foto-borrar" onClick={() => borrarFoto(url, i)}>X</button>
                        {i === 0 && <div style={{ position: "absolute", bottom: 4, left: 4, background: "#2563eb", color: "white", fontSize: 9, padding: "1px 5px", borderRadius: 4, fontWeight: "bold" }}>PRINCIPAL</div>}
                      </div>
                    ))}
                  </div>
                )}
                <input ref={inputFotoRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => subirFotos(e.target.files)} />
                <div className={"zona-fotos" + (arrastrando ? " arrastrando" : "")} onClick={() => !subiendo && inputFotoRef.current.click()} onDragOver={e => { e.preventDefault(); setArrastrando(true); }} onDragLeave={() => setArrastrando(false)} onDrop={e => { e.preventDefault(); setArrastrando(false); subirFotos(e.dataTransfer.files); }}>
                  {subiendo ? (
                    <div>
                      <p style={{ color: "#2563eb", fontWeight: 600, marginBottom: 8 }}>Subiendo... {progreso}%</p>
                      <div className="barra-progreso"><div className="barra-relleno" style={{ width: progreso + "%" }} /></div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: "#6b7280", marginBottom: 4 }}>Arrastrar fotos o hacer clic para seleccionar</p>
                      <p style={{ fontSize: 12, color: "#9ca3af" }}>JPG, PNG, WEBP - maximo 8MB por foto</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button className="btn btn-azul" onClick={guardar} disabled={guardando || subiendo}>{guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear propiedad"}</button>
              <button className="btn btn-gris" onClick={() => setModal(false)} disabled={subiendo}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// PUBLICAR
function Publicar({ propiedades, portalesConfig, recargar, mostrarAviso }) {
  const [propSel,      setPropSel]      = useState(null);
  const [portalesSel,  setPortalesSel]  = useState([]);
  const [publicando,   setPublicando]   = useState(false);
  const portalesActivos = portalesConfig.filter(p => p.activo);

  useEffect(() => {
    if (propSel) {
      const p = propiedades.find(x => x.id === propSel);
      setPortalesSel(p ? p.portales || [] : []);
    }
  }, [propSel]);

  const togglePortal = (id) => setPortalesSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const publicar = async () => {
    if (!propSel || portalesSel.length === 0) return;
    setPublicando(true);
    await new Promise(r => setTimeout(r, 1500));
    await supabase.from("propiedades").update({ portales: portalesSel, estado: "publicado" }).eq("id", propSel);
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
      {portalesActivos.length === 0 && (
        <div className="alerta alerta-warn">No tenes portales configurados. Ve a la seccion "Portales" para conectar tus cuentas.</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 14, color: "#374151" }}>1. Elige la propiedad</h3>
          {propiedades.map(p => (
            <div key={p.id} onClick={() => setPropSel(p.id)} className="card" style={{ cursor: "pointer", border: propSel === p.id ? "2px solid #2563eb" : "1px solid #e5e7eb", background: propSel === p.id ? "#eff6ff" : "white", marginBottom: 10, padding: 14 }}>
              <div style={{ display: "flex", gap: 12 }}>
                {(p.fotos || []).length > 0 && <img src={p.fotos[0]} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 3 }}>{p.titulo}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{p.operacion} - {p.tipo}</div>
                  {p.precio > 0 && <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 600 }}>{p.moneda === "USD" ? "USD" : "$"} {p.precio.toLocaleString()}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 14, color: "#374151" }}>2. Elige los portales</h3>
          <div className="card" style={{ marginBottom: 16 }}>
            {PORTALES.map(p => {
              const config     = portalesConfig.find(c => c.id === p.id);
              const estaActivo = config && config.activo;
              return (
                <div key={p.id} onClick={() => estaActivo && togglePortal(p.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6", cursor: estaActivo ? "pointer" : "not-allowed", opacity: estaActivo ? 1 : 0.45 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                    {!estaActivo && <span style={{ fontSize: 11, color: "#9ca3af" }}>(no configurado)</span>}
                  </div>
                  <div style={{ width: 22, height: 22, border: "2px solid " + (portalesSel.includes(p.id) ? "#2563eb" : "#d1d5db"), borderRadius: 4, background: portalesSel.includes(p.id) ? "#2563eb" : "white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: "bold" }}>
                    {portalesSel.includes(p.id) ? "v" : ""}
                  </div>
                </div>
              );
            })}
          </div>
          {prop && (
            <div className="card" style={{ background: "#f8fafc", marginBottom: 16 }}>
              {(prop.fotos || []).length > 0 && <img src={prop.fotos[0]} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />}
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{prop.titulo}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{prop.operacion} - {prop.tipo}</div>
              {prop.precio > 0 && <div style={{ fontSize: 15, color: "#2563eb", fontWeight: 700, marginTop: 6 }}>{prop.moneda === "USD" ? "USD" : "$"} {prop.precio.toLocaleString()}</div>}
              <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>Se publicara en {portalesSel.length} portal(es){(prop.fotos || []).length > 0 ? " con " + prop.fotos.length + " foto(s)" : ""}</div>
            </div>
          )}
          <button className="btn btn-azul" disabled={!propSel || portalesSel.length === 0 || publicando} onClick={publicar} style={{ width: "100%", padding: 13, fontSize: 15, justifyContent: "center" }}>
            {publicando ? "Publicando..." : "Publicar en " + portalesSel.length + " portal(es)"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ALQUILERES
function Alquileres({ contratos, propiedades, recargar, mostrarAviso }) {
  const [contratoSel, setContratoSel] = useState(null);
  const [tab,         setTab]         = useState("pagos");
  const [modalNuevo,  setModalNuevo]  = useState(false);
  const [modalPago,   setModalPago]   = useState(false);
  const [modalExp,    setModalExp]    = useState(false);
  const [modalRep,    setModalRep]    = useState(false);
  const [modalDoc,    setModalDoc]    = useState(false);
  const inputDocRef = useRef();

  const ct = contratos.find(c => c.id === contratoSel);

  const actualizarContrato = async (id, cambios) => {
    await supabase.from("contratos").update(cambios).eq("id", id);
    await recargar();
  };

  const marcarPagado = async (pagoId) => {
    const nuevos = ct.pagos.map(p => p.id === pagoId ? { ...p, estado: "pagado", fecha_pago: new Date().toISOString().split("T")[0] } : p);
    await actualizarContrato(ct.id, { pagos: nuevos });
    mostrarAviso("Pago registrado");
  };

  const agregarPago = async (form) => {
    const nuevo = { id: Date.now(), mes: form.mes, monto: Number(form.monto), estado: "pendiente", fecha_pago: null };
    await actualizarContrato(ct.id, { pagos: [...ct.pagos, nuevo] });
    setModalPago(false);
    mostrarAviso("Cuota agregada");
  };

  const agregarExpensa = async (form) => {
    const nuevo = { id: Date.now(), mes: form.mes, monto: Number(form.monto), concepto: form.concepto || "Expensas", estado: "pendiente" };
    await actualizarContrato(ct.id, { expensas: [...ct.expensas, nuevo] });
    setModalExp(false);
    mostrarAviso("Expensa registrada");
  };

  const marcarExpensaPagada = async (expId) => {
    const nuevas = ct.expensas.map(e => e.id === expId ? { ...e, estado: "pagado" } : e);
    await actualizarContrato(ct.id, { expensas: nuevas });
    mostrarAviso("Expensa registrada como pagada");
  };

  const agregarReparacion = async (form) => {
    const nuevo = { id: Date.now(), fecha: form.fecha, descripcion: form.descripcion, monto: Number(form.monto) || 0, responsable: form.responsable, estado: "pendiente" };
    await actualizarContrato(ct.id, { reparaciones: [...ct.reparaciones, nuevo] });
    setModalRep(false);
    mostrarAviso("Reparacion registrada");
  };

  const resolverReparacion = async (repId) => {
    const nuevas = ct.reparaciones.map(r => r.id === repId ? { ...r, estado: "resuelto" } : r);
    await actualizarContrato(ct.id, { reparaciones: nuevas });
    mostrarAviso("Reparacion marcada como resuelta");
  };

  const subirDocumento = async (archivo, tipo) => {
    if (!archivo) return;
    const nombre = "doc_" + Date.now() + "_" + archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const { error } = await supabase.storage.from("fotos").upload(nombre, archivo);
    if (error) { mostrarAviso("Error al subir el archivo", "error"); return; }
    const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(nombre);
    const nuevo = { id: Date.now(), nombre: archivo.name, tipo: tipo, url: urlData.publicUrl, fecha: new Date().toISOString().split("T")[0] };
    await actualizarContrato(ct.id, { documentos: [...ct.documentos, nuevo] });
    setModalDoc(false);
    mostrarAviso("Documento subido correctamente");
  };

  const eliminarContrato = async (id) => {
    if (!window.confirm("Confirmas que queres eliminar este contrato?")) return;
    await supabase.from("contratos").delete().eq("id", id);
    setContratoSel(null);
    await recargar();
    mostrarAviso("Contrato eliminado");
  };

  const totalCobrado = ct ? ct.pagos.filter(p => p.estado === "pagado").reduce((a, p) => a + p.monto, 0) : 0;
  const totalPendiente = ct ? ct.pagos.filter(p => p.estado === "pendiente").reduce((a, p) => a + p.monto, 0) : 0;

  const estadoBadge = (estado) => {
    if (estado === "activo")     return "badge-verde";
    if (estado === "finalizado") return "badge-gris";
    if (estado === "en mora")    return "badge-rojo";
    return "badge-amarillo";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#1e3a5f" }}>Administracion de Alquileres</h2>
          <p style={{ color: "#6b7280", marginTop: 4 }}>{contratos.length} contrato(s) en gestion</p>
        </div>
        <button className="btn btn-azul" onClick={() => setModalNuevo(true)}>+ Nuevo contrato</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

        {/* Lista de contratos */}
        <div>
          {contratos.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
              <p>No hay contratos todavia.</p>
              <p style={{ marginTop: 6, fontSize: 13 }}>Hace clic en "Nuevo contrato" para empezar.</p>
            </div>
          )}
          {contratos.map(c => {
            const prop = propiedades.find(p => p.id === c.propiedad_id);
            const pendientes = c.pagos.filter(p => p.estado === "pendiente").length;
            return (
              <div key={c.id} className={"contrato-card" + (contratoSel === c.id ? " seleccionado" : "")} onClick={() => { setContratoSel(c.id); setTab("pagos"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{c.inquilino ? c.inquilino.nombre : "Sin nombre"}</div>
                  <span className={"badge " + estadoBadge(c.estado)}>{c.estado}</span>
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{prop ? prop.titulo : "Propiedad no encontrada"}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{c.tipo === "permanente" ? "Permanente" : "Temporal"} - Vence dia {c.dia_vencimiento}</div>
                <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, marginTop: 4 }}>{c.moneda === "USD" ? "USD" : "$"} {(c.precio_base || 0).toLocaleString()}/mes</div>
                {pendientes > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#991b1b", background: "#fee2e2", padding: "2px 8px", borderRadius: 6, display: "inline-block" }}>{pendientes} pago(s) pendiente(s)</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detalle del contrato */}
        {ct ? (
          <div>
            {/* Encabezado */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#1e3a5f", marginBottom: 4 }}>{ct.inquilino ? ct.inquilino.nombre : ""}</div>
                  <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>{(propiedades.find(p => p.id === ct.propiedad_id) || {}).titulo || ""}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <div className="info-label">Periodo</div>
                      <div className="info-valor">{ct.inicio} al {ct.fin}</div>
                    </div>
                    <div>
                      <div className="info-label">Precio</div>
                      <div className="info-valor" style={{ color: "#2563eb" }}>{ct.moneda === "USD" ? "USD" : "$"} {(ct.precio_base || 0).toLocaleString()}/mes</div>
                    </div>
                    <div>
                      <div className="info-label">Ajuste</div>
                      <div className="info-valor">{ct.ajuste} cada {ct.periodo_ajuste} meses</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className={"badge " + estadoBadge(ct.estado)}>{ct.estado}</span>
                  <button className="btn btn-rojo btn-sm" onClick={() => eliminarContrato(ct.id)}>Eliminar</button>
                </div>
              </div>

              {/* Datos inquilino y garante */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
                {ct.inquilino && (
                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                    <div className="info-label" style={{ marginBottom: 6 }}>Inquilino/a</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{ct.inquilino.nombre}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>DNI: {ct.inquilino.dni}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{ct.inquilino.email}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{ct.inquilino.tel}</div>
                  </div>
                )}
                {ct.garante && ct.garante.nombre && (
                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                    <div className="info-label" style={{ marginBottom: 6 }}>Garante</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{ct.garante.nombre}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>DNI: {ct.garante.dni}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{ct.garante.email}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{ct.garante.tel}</div>
                  </div>
                )}
              </div>
              {ct.notas && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", fontSize: 13, color: "#78350f" }}>
                  Notas: {ct.notas}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[["pagos","Pagos"],["expensas","Expensas"],["reparaciones","Reparaciones"],["documentos","Documentos"]].map(([id, label]) => (
                <button key={id} className={"tab" + (tab === id ? " activo" : "")} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>

            {/* TAB PAGOS */}
            {tab === "pagos" && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="seccion-titulo">Seguimiento de pagos</div>
                  <button className="btn btn-azul btn-sm" onClick={() => setModalPago(true)}>+ Agregar cuota</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#f0fdf4", padding: 14, borderRadius: 8, border: "1px solid #86efac" }}>
                    <div className="info-label">Total cobrado</div>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: "#166534" }}>{ct.moneda === "USD" ? "USD" : "$"} {totalCobrado.toLocaleString()}</div>
                  </div>
                  <div style={{ background: "#fff7ed", padding: 14, borderRadius: 8, border: "1px solid #fed7aa" }}>
                    <div className="info-label">Total pendiente</div>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: "#c2410c" }}>{ct.moneda === "USD" ? "USD" : "$"} {totalPendiente.toLocaleString()}</div>
                  </div>
                </div>

                {ct.pagos.length === 0 && <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>Sin cuotas registradas. Agrega la primera.</p>}
                {ct.pagos.map(pago => (
                  <div key={pago.id} className="fila-tabla">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{pago.mes}</div>
                      {pago.fecha_pago && <div style={{ fontSize: 12, color: "#6b7280" }}>Pagado el {pago.fecha_pago}</div>}
                    </div>
                    <div style={{ fontWeight: 600, color: pago.estado === "pagado" ? "#166534" : "#c2410c", fontSize: 15 }}>
                      {ct.moneda === "USD" ? "USD" : "$"} {pago.monto.toLocaleString()}
                    </div>
                    <span className={"badge " + (pago.estado === "pagado" ? "badge-verde" : "badge-rojo")}>{pago.estado}</span>
                    {pago.estado === "pendiente" && (
                      <button className="btn btn-verde btn-sm" onClick={() => marcarPagado(pago.id)}>Marcar pagado</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB EXPENSAS */}
            {tab === "expensas" && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="seccion-titulo">Expensas y servicios</div>
                  <button className="btn btn-azul btn-sm" onClick={() => setModalExp(true)}>+ Agregar</button>
                </div>
                {ct.expensas.length === 0 && <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>Sin expensas registradas.</p>}
                {ct.expensas.map(e => (
                  <div key={e.id} className="fila-tabla">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{e.mes}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{e.concepto}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>$ {e.monto.toLocaleString()}</div>
                    <span className={"badge " + (e.estado === "pagado" ? "badge-verde" : "badge-amarillo")}>{e.estado}</span>
                    {e.estado === "pendiente" && (
                      <button className="btn btn-verde btn-sm" onClick={() => marcarExpensaPagada(e.id)}>Marcar pagado</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB REPARACIONES */}
            {tab === "reparaciones" && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="seccion-titulo">Reparaciones y mantenimiento</div>
                  <button className="btn btn-azul btn-sm" onClick={() => setModalRep(true)}>+ Registrar</button>
                </div>
                {ct.reparaciones.length === 0 && <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>Sin reparaciones registradas.</p>}
                {ct.reparaciones.map(r => (
                  <div key={r.id} className="fila-tabla" style={{ alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{r.descripcion}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Fecha: {r.fecha} - Responsable: {r.responsable}</div>
                      {r.monto > 0 && <div style={{ fontSize: 13, color: "#2563eb", marginTop: 2 }}>Costo: $ {r.monto.toLocaleString()}</div>}
                    </div>
                    <span className={"badge " + (r.estado === "resuelto" ? "badge-verde" : "badge-amarillo")}>{r.estado}</span>
                    {r.estado === "pendiente" && (
                      <button className="btn btn-verde btn-sm" onClick={() => resolverReparacion(r.id)}>Marcar resuelto</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB DOCUMENTOS */}
            {tab === "documentos" && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="seccion-titulo">Documentacion digital</div>
                  <button className="btn btn-azul btn-sm" onClick={() => setModalDoc(true)}>+ Subir documento</button>
                </div>
                <input ref={inputDocRef} type="file" style={{ display: "none" }} />
                {ct.documentos.length === 0 && <p style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>Sin documentos subidos.</p>}
                {ct.documentos.map(d => (
                  <div key={d.id} className="fila-tabla">
                    <div style={{ width: 36, height: 36, background: "#dbeafe", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", color: "#1e40af", flexShrink: 0 }}>
                      {d.tipo === "contrato" ? "CTR" : d.tipo === "dni" ? "DNI" : d.tipo === "recibo" ? "REC" : "DOC"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{d.nombre}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{d.tipo} - Subido el {d.fecha}</div>
                    </div>
                    <a href={d.url} target="_blank" rel="noreferrer" className="btn btn-gris btn-sm" style={{ textDecoration: "none" }}>Ver</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "#9ca3af" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 16 }}>Selecciona un contrato de la lista</p>
              <p style={{ fontSize: 14, marginTop: 6 }}>o crea uno nuevo con el boton de arriba</p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL NUEVO CONTRATO */}
      {modalNuevo && <ModalNuevoContrato propiedades={propiedades} onGuardar={async (datos) => { await supabase.from("contratos").insert([datos]); await recargar(); setModalNuevo(false); mostrarAviso("Contrato creado"); }} onCerrar={() => setModalNuevo(false)} />}

      {/* MODAL AGREGAR PAGO */}
      {modalPago && (
        <ModalSimple titulo="Agregar cuota" campos={[["mes","Mes (ej: Mayo 2026)","text"],["monto","Monto","number"]]} onGuardar={agregarPago} onCerrar={() => setModalPago(false)} />
      )}

      {/* MODAL AGREGAR EXPENSA */}
      {modalExp && (
        <ModalSimple titulo="Agregar expensa" campos={[["mes","Mes (ej: Mayo 2026)","text"],["concepto","Concepto (ej: Expensas, Luz, Gas)","text"],["monto","Monto","number"]]} onGuardar={agregarExpensa} onCerrar={() => setModalExp(false)} />
      )}

      {/* MODAL REPARACION */}
      {modalRep && (
        <ModalSimple titulo="Registrar reparacion" campos={[["descripcion","Descripcion","text"],["fecha","Fecha","date"],["monto","Costo (opcional)","number"],["responsable","Responsable (Propietario / Inquilino)","text"]]} onGuardar={agregarReparacion} onCerrar={() => setModalRep(false)} />
      )}

      {/* MODAL DOCUMENTO */}
      {modalDoc && <ModalDocumento onGuardar={subirDocumento} onCerrar={() => setModalDoc(false)} />}
    </div>
  );
}

function ModalNuevoContrato({ propiedades, onGuardar, onCerrar }) {
  const [form, setForm] = useState({ propiedad_id: propiedades[0] ? propiedades[0].id : "", tipo: "permanente", inicio: "", fin: "", precio_base: "", moneda: "ARS", dia_vencimiento: 10, ajuste: "ICL", periodo_ajuste: 3, deposito: "", deposito_pagado: false, estado: "activo", notas: "", inquilino: { nombre: "", dni: "", email: "", tel: "" }, garante: { nombre: "", dni: "", email: "", tel: "" } });
  const [guardando, setGuardando] = useState(false);
  const set    = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setInq = (k, v) => setForm(p => ({ ...p, inquilino: { ...p.inquilino, [k]: v } }));
  const setGar = (k, v) => setForm(p => ({ ...p, garante:   { ...p.garante,   [k]: v } }));

  const guardar = async () => {
    if (!form.inquilino.nombre) { alert("El nombre del inquilino es obligatorio"); return; }
    if (!form.inicio || !form.fin) { alert("Las fechas de inicio y fin son obligatorias"); return; }
    setGuardando(true);
    await onGuardar({ propiedad_id: Number(form.propiedad_id), tipo: form.tipo, inicio: form.inicio, fin: form.fin, precio_base: Number(form.precio_base) || 0, moneda: form.moneda, dia_vencimiento: Number(form.dia_vencimiento) || 10, ajuste: form.ajuste, periodo_ajuste: Number(form.periodo_ajuste) || 3, deposito: Number(form.deposito) || 0, deposito_pagado: form.deposito_pagado, estado: form.estado, notas: form.notas, inquilino: form.inquilino, garante: form.garante, pagos: [], expensas: [], reparaciones: [], documentos: [] });
    setGuardando(false);
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>Nuevo contrato de alquiler</h3>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Propiedad</label>
              <select className="input" value={form.propiedad_id} onChange={e => set("propiedad_id", e.target.value)}>
                {propiedades.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Tipo de contrato</label>
              <select className="input" value={form.tipo} onChange={e => set("tipo", e.target.value)}>
                <option value="permanente">Permanente</option>
                <option value="temporal">Temporal</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Fecha inicio</label>
              <input className="input" type="date" value={form.inicio} onChange={e => set("inicio", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Fecha fin</label>
              <input className="input" type="date" value={form.fin} onChange={e => set("fin", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Precio mensual</label>
              <input className="input" type="number" value={form.precio_base} onChange={e => set("precio_base", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Moneda</label>
              <select className="input" value={form.moneda} onChange={e => set("moneda", e.target.value)}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Dia vencimiento</label>
              <input className="input" type="number" value={form.dia_vencimiento} onChange={e => set("dia_vencimiento", e.target.value)} min="1" max="31" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Tipo ajuste</label>
              <select className="input" value={form.ajuste} onChange={e => set("ajuste", e.target.value)}>
                <option value="ICL">ICL</option>
                <option value="IPC">IPC</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Cada (meses)</label>
              <input className="input" type="number" value={form.periodo_ajuste} onChange={e => set("periodo_ajuste", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Deposito</label>
              <input className="input" type="number" value={form.deposito} onChange={e => set("deposito", e.target.value)} />
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e3a5f", marginBottom: 12 }}>Datos del inquilino/a</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["nombre","Nombre y apellido"],["dni","DNI"],["email","Email"],["tel","Telefono"]].map(([k, l]) => (
                <div key={k}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>{l}</label>
                  <input className="input" value={form.inquilino[k]} onChange={e => setInq(k, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e3a5f", marginBottom: 12 }}>Datos del garante (opcional)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["nombre","Nombre y apellido"],["dni","DNI"],["email","Email"],["tel","Telefono"]].map(([k, l]) => (
                <div key={k}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>{l}</label>
                  <input className="input" value={form.garante[k]} onChange={e => setGar(k, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Notas internas</label>
            <textarea className="input" value={form.notas} onChange={e => set("notas", e.target.value)} rows={2} style={{ resize: "vertical" }} placeholder="Ej: Acepta mascotas, estacionamiento incluido, etc." />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button className="btn btn-azul" onClick={guardar} disabled={guardando}>{guardando ? "Guardando..." : "Crear contrato"}</button>
          <button className="btn btn-gris" onClick={onCerrar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function ModalSimple({ titulo, campos, onGuardar, onCerrar }) {
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    await onGuardar(form);
    setGuardando(false);
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 17, fontWeight: "bold", marginBottom: 18 }}>{titulo}</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {campos.map(([k, l, t]) => (
            <div key={k}>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>{l}</label>
              <input className="input" type={t} value={form[k] || ""} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className="btn btn-azul" onClick={guardar} disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</button>
          <button className="btn btn-gris" onClick={onCerrar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function ModalDocumento({ onGuardar, onCerrar }) {
  const [tipo,     setTipo]     = useState("contrato");
  const [archivo,  setArchivo]  = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const ref = useRef();

  const tiposDoc = [["contrato","Contrato firmado"],["dni","DNI inquilino/garante"],["recibo","Recibo de pago"],["inventario","Inventario del inmueble"],["foto","Foto estado inicial"],["otro","Otro documento"]];

  const handleSubir = async () => {
    if (!archivo) { alert("Selecciona un archivo primero"); return; }
    setSubiendo(true);
    await onGuardar(archivo, tipo);
    setSubiendo(false);
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 17, fontWeight: "bold", marginBottom: 18 }}>Subir documento</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Tipo de documento</label>
          <select className="input" value={tipo} onChange={e => setTipo(e.target.value)}>
            {tiposDoc.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Archivo</label>
          <input ref={ref} type="file" style={{ display: "none" }} onChange={e => setArchivo(e.target.files[0])} />
          <div onClick={() => ref.current.click()} style={{ border: "2px dashed #d1d5db", borderRadius: 8, padding: 20, textAlign: "center", cursor: "pointer" }}>
            {archivo ? (
              <div>
                <div style={{ fontWeight: 600, color: "#1e3a5f" }}>{archivo.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{(archivo.size / 1024).toFixed(0)} KB</div>
              </div>
            ) : (
              <div style={{ color: "#6b7280" }}>
                <p>Hacer clic para seleccionar</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>PDF, JPG, PNG - maximo 10MB</p>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-azul" onClick={handleSubir} disabled={subiendo || !archivo}>{subiendo ? "Subiendo..." : "Subir documento"}</button>
          <button className="btn btn-gris" onClick={onCerrar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// PORTALES
function Portales({ portalesConfig, recargar, mostrarAviso }) {
  const [guardando,  setGuardando]  = useState(null);
  const [expandido,  setExpandido]  = useState(null);
  const [forms,      setForms]      = useState({});

  useEffect(() => {
    const inicial = {};
    portalesConfig.forEach(p => { inicial[p.id] = { app_id: p.app_id || "", secret_key: p.secret_key || "", access_token: p.access_token || "" }; });
    setForms(inicial);
  }, [portalesConfig]);

  const setField = (portalId, campo, valor) => setForms(prev => ({ ...prev, [portalId]: { ...prev[portalId], [campo]: valor } }));

  const guardarPortal = async (portalId) => {
    setGuardando(portalId);
    const f = forms[portalId] || {};
    const tieneCredenciales = f.app_id || f.secret_key || f.access_token;
    await supabase.from("portal_config").update({ app_id: f.app_id || "", secret_key: f.secret_key || "", access_token: f.access_token || "", activo: !!tieneCredenciales, actualizado: new Date().toISOString().split("T")[0] }).eq("id", portalId);
    await recargar();
    setGuardando(null);
    mostrarAviso("Configuracion guardada");
  };

  const toggleActivo = async (portalId, valorActual) => {
    await supabase.from("portal_config").update({ activo: !valorActual }).eq("id", portalId);
    await recargar();
  };

  const portalesActivos = portalesConfig.filter(p => p.activo).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#1e3a5f" }}>Configuracion de Portales</h2>
        <p style={{ color: "#6b7280", marginTop: 4 }}>Conecta tus cuentas para publicar en todos los portales al mismo tiempo</p>
      </div>
      <div className={"alerta " + (portalesActivos > 0 ? "alerta-ok" : "alerta-warn")} style={{ marginBottom: 20 }}>
        {portalesActivos === 0 ? "Ningun portal configurado todavia. Completa las credenciales de al menos uno para poder publicar." : portalesActivos + " portal(es) activo(s). Podes publicar desde la seccion Publicar."}
      </div>
      {PORTALES.map(portal => {
        const config  = portalesConfig.find(c => c.id === portal.id) || {};
        const f       = forms[portal.id] || {};
        const abierto = expandido === portal.id;
        return (
          <div key={portal.id} className={"portal-card" + (config.activo ? " conectado" : "")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: portal.color }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{portal.nombre}</div>
                  <div style={{ fontSize: 12, marginTop: 2, color: config.activo ? "#16a34a" : "#6b7280" }}>
                    {config.activo ? "Conectado" : "No configurado"}
                    {config.actualizado && " - Actualizado: " + config.actualizado}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {config.activo !== undefined && (
                  <button className={"toggle" + (config.activo ? " activo" : "")} onClick={() => toggleActivo(portal.id, config.activo)}>
                    <div className="toggle-circulo" />
                  </button>
                )}
                <button className="btn btn-gris btn-sm" onClick={() => setExpandido(abierto ? null : portal.id)}>
                  {abierto ? "Cerrar" : "Configurar"}
                </button>
              </div>
            </div>
            {abierto && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #e5e7eb" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Como obtener las credenciales:</div>
                  {portal.instrucciones.split("\n").map((linea, i) => <div key={i} style={{ fontSize: 13, color: "#6b7280", marginBottom: 3 }}>{linea}</div>)}
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {portal.id === "mercadolibre" && (
                    <>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>App ID (Client ID)</label>
                        <input className="input" type="text" value={f.app_id || ""} onChange={e => setField(portal.id, "app_id", e.target.value)} placeholder="Ej: 123456789" />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Secret Key</label>
                        <input className="input" type="password" value={f.secret_key || ""} onChange={e => setField(portal.id, "secret_key", e.target.value)} placeholder="Tu Secret Key de MercadoLibre" />
                      </div>
                    </>
                  )}
                  {(portal.id === "zonaprop" || portal.id === "argenprop") && (
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>API Key</label>
                      <input className="input" type="password" value={f.app_id || ""} onChange={e => setField(portal.id, "app_id", e.target.value)} placeholder={"Tu API Key de " + portal.nombre} />
                    </div>
                  )}
                  {(portal.id === "airbnb" || portal.id === "booking") && (
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Access Token</label>
                      <input className="input" type="password" value={f.access_token || ""} onChange={e => setField(portal.id, "access_token", e.target.value)} placeholder={"Tu token de " + portal.nombre} />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button className="btn btn-verde" onClick={() => guardarPortal(portal.id)} disabled={guardando === portal.id}>{guardando === portal.id ? "Guardando..." : "Guardar y activar"}</button>
                  <button className="btn btn-gris" onClick={() => setExpandido(null)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
