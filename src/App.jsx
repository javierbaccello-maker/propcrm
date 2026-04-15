import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const PORTALES = [
  { id: "mercadolibre", nombre: "Mercado Libre", color: "#FFE600", instrucciones: "1. Anda a developers.mercadolibre.com.ar\n2. Inicia sesion con tu cuenta de MercadoLibre\n3. Crea una aplicacion nueva\n4. En Scopes tilda 'items' y 'pictures'\n5. Copia el App ID y el Secret Key" },
  { id: "zonaprop",     nombre: "Zona Prop",      color: "#E8323B", instrucciones: "1. Llama a tu ejecutivo de cuenta de Zonaprop\n2. Pedi acceso a la API para integracion con software propio\n3. Te van a dar una API Key\n4. Pegala en el campo de abajo" },
  { id: "argenprop",    nombre: "Argenprop",       color: "#1A56DB", instrucciones: "1. Llama a tu ejecutivo de cuenta de Argenprop\n2. Pedi acceso a la API para integracion con software propio\n3. Te van a dar una API Key\n4. Pegala en el campo de abajo" },
  { id: "airbnb",       nombre: "Airbnb",          color: "#FF5A5F", instrucciones: "1. Anda a airbnb.com.ar con tu cuenta\n2. Ve a Herramientas para anfitriones\n3. Busca Software de gestion de propiedades\n4. Conecta un software externo y copia el token" },
  { id: "booking",      nombre: "Booking.com",     color: "#003580", instrucciones: "1. Ingresa a admin.booking.com\n2. Ve a Cuenta > Conectividad\n3. Busca Conectar con un proveedor de software\n4. Solicita acceso a la API y copia las credenciales" },
];

const TIPOS = ["Departamento", "Casa", "PH", "Local Comercial", "Oficina", "Terreno"];
const OPERACIONES = ["Venta", "Alquiler", "Alquiler Temporal"];

const estilos = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #f0f2f5; color: #333; }
  .btn { padding: 9px 18px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
  .btn-azul { background: #2563eb; color: white; }
  .btn-azul:hover { background: #1d4ed8; }
  .btn-azul:disabled { background: #93c5fd; cursor: not-allowed; }
  .btn-rojo { background: #dc2626; color: white; }
  .btn-gris { background: #e5e7eb; color: #374151; }
  .btn-verde { background: #16a34a; color: white; }
  .btn-verde:hover { background: #15803d; }
  .input { width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; font-family: Arial, sans-serif; }
  .input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px #dbeafe; }
  .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px; }
  .tag { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; margin: 2px; }
  .modal-fondo { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .modal { background: white; border-radius: 12px; padding: 28px; max-width: 640px; width: 100%; max-height: 92vh; overflow-y: auto; }
  .alerta { padding: 10px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 12px; }
  .alerta-ok    { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .alerta-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
  .zona-fotos { border: 2px dashed #d1d5db; border-radius: 10px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
  .zona-fotos:hover { border-color: #2563eb; background: #eff6ff; }
  .zona-fotos.arrastrando { border-color: #2563eb; background: #eff6ff; }
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
  .nav-btn:hover { background: #1e4a7a; color: white; }
  .nav-btn.activo { background: #2563eb; color: white; }
  .barra-progreso { width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-top: 8px; }
  .barra-relleno { height: 100%; background: #2563eb; border-radius: 3px; transition: width 0.3s; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 10px 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 13px; color: #6b7280; font-weight: 600; }
  td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; vertical-align: middle; }
  tr:hover td { background: #f9fafb; }
`;

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState("propiedades");
  const [propiedades, setPropiedades] = useState([]);
  const [portalesConfig, setPortalesConfig] = useState([]);
  const [aviso, setAviso] = useState(null);

  const mostrarAviso = (msg, tipo) => {
    setAviso({ msg, tipo: tipo || "ok" });
    setTimeout(() => setAviso(null), 3500);
  };

  const cargarDatos = async () => {
    const { data: props } = await supabase.from("propiedades").select("*").order("id", { ascending: false });
    if (props) setPropiedades(props.map(p => ({ ...p, portales: Array.isArray(p.portales) ? p.portales : [], fotos: Array.isArray(p.fotos) ? p.fotos : [] })));

    const { data: config } = await supabase.from("portal_config").select("*");
    if (config) setPortalesConfig(config);
  };

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario]);

  if (!usuario) {
    return (
      <>
        <style>{estilos}</style>
        <Login onLogin={setUsuario} />
      </>
    );
  }

  const MENU = [
    { id: "propiedades", label: "Propiedades" },
    { id: "publicar",    label: "Publicar" },
    { id: "portales",    label: "Portales" },
  ];

  return (
    <>
      <style>{estilos}</style>

      {aviso && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, minWidth: 260 }}>
          <div className={"alerta " + (aviso.tipo === "ok" ? "alerta-ok" : "alerta-error")}>{aviso.msg}</div>
        </div>
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: 210, background: "#1e3a5f", color: "white", padding: "24px 14px", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 24, color: "#93c5fd", paddingLeft: 4 }}>PropCRM</div>
          {MENU.map(m => (
            <button key={m.id} className={"nav-btn" + (pagina === m.id ? " activo" : "")} onClick={() => setPagina(m.id)}>
              {m.label}
            </button>
          ))}
          <div style={{ marginTop: "auto", borderTop: "1px solid #2d5a8e", paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 6 }}>Conectado como:</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{usuario.nombre}</div>
            <button onClick={() => { setUsuario(null); setPropiedades([]); setPortalesConfig([]); }} style={{ marginTop: 10, background: "transparent", color: "#93c5fd", border: "1px solid #2d5a8e", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, width: "100%" }}>
              Cerrar sesion
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: 28, overflow: "auto" }}>
          {pagina === "propiedades" && <Propiedades propiedades={propiedades} recargar={cargarDatos} mostrarAviso={mostrarAviso} />}
          {pagina === "publicar"    && <Publicar propiedades={propiedades} portalesConfig={portalesConfig} recargar={cargarDatos} mostrarAviso={mostrarAviso} />}
          {pagina === "portales"    && <Portales portalesConfig={portalesConfig} recargar={cargarDatos} mostrarAviso={mostrarAviso} />}
        </main>
      </div>
    </>
  );
}

// --- LOGIN --------------------------------------------------------------------

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
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
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Credenciales de prueba:</div>
          <div style={{ fontSize: 13, fontFamily: "monospace" }}>admin@propcrm.com</div>
          <div style={{ fontSize: 13, fontFamily: "monospace" }}>Admin2026!</div>
        </div>
      </div>
    </div>
  );
}

// --- PROPIEDADES --------------------------------------------------------------

function Propiedades({ propiedades, recargar, mostrarAviso }) {
  const [modal, setModal]       = useState(false);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ titulo: "", tipo: "Departamento", operacion: "Alquiler", precio: "", moneda: "ARS", direccion: "", m2: "", ambientes: "", descripcion: "", fotos: [] });
  const [subiendo, setSubiendo] = useState(false);
  const [progresoFoto, setProgresoFoto] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const inputFotoRef = useRef();

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

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const subirFotos = async (archivos) => {
    const permitidos = Array.from(archivos).filter(f => f.type.startsWith("image/"));
    if (permitidos.length === 0) { mostrarAviso("Solo se permiten imagenes (JPG, PNG, WEBP)", "error"); return; }
    setSubiendo(true);
    const urlsNuevas = [];
    for (let i = 0; i < permitidos.length; i++) {
      const archivo = permitidos[i];
      if (archivo.size > 8 * 1024 * 1024) { mostrarAviso("La imagen " + archivo.name + " supera 8MB", "error"); continue; }
      const nombre = Date.now() + "_" + archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const { data, error } = await supabase.storage.from("fotos").upload(nombre, archivo, { cacheControl: "3600", upsert: false });
      if (!error) {
        const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(nombre);
        urlsNuevas.push(urlData.publicUrl);
      }
      setProgresoFoto(Math.round(((i + 1) / permitidos.length) * 100));
    }
    setForm(p => ({ ...p, fotos: [...p.fotos, ...urlsNuevas] }));
    setSubiendo(false);
    setProgresoFoto(0);
    mostrarAviso(urlsNuevas.length + " foto(s) subida(s) correctamente");
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
          <div style={{ display: "flex", gap: 16 }}>
            {(p.fotos || []).length > 0 && (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {p.fotos.slice(0, 3).map((url, i) => (
                  <img key={i} src={url} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
                ))}
                {p.fotos.length > 3 && (
                  <div style={{ width: 80, height: 80, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#6b7280", fontWeight: 600 }}>
                    +{p.fotos.length - 3}
                  </div>
                )}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{p.titulo}</h3>
                <span style={{ background: p.estado === "publicado" ? "#dcfce7" : "#fef9c3", color: p.estado === "publicado" ? "#166534" : "#854d0e", padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                  {p.estado || "borrador"}
                </span>
                {(p.fotos || []).length > 0 && (
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{p.fotos.length} foto(s)</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 16, color: "#6b7280", fontSize: 13, marginBottom: 8, flexWrap: "wrap" }}>
                <span>{p.operacion}</span>
                <span>{p.tipo}</span>
                {p.m2 > 0 && <span>{p.m2} m2</span>}
                {p.ambientes > 0 && <span>{p.ambientes} amb.</span>}
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
                <label style={{ fontSize: 13, display: "block", marginBottom: 5, fontWeight: 500 }}>Titulo *</label>
                <input className="input" value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ej: Departamento 2 ambientes en Palermo" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5, fontWeight: 500 }}>Tipo</label>
                  <select className="input" value={form.tipo} onChange={e => set("tipo", e.target.value)}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5, fontWeight: 500 }}>Operacion</label>
                  <select className="input" value={form.operacion} onChange={e => set("operacion", e.target.value)}>
                    {OPERACIONES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5, fontWeight: 500 }}>Precio</label>
                  <input className="input" type="number" value={form.precio} onChange={e => set("precio", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5, fontWeight: 500 }}>Moneda</label>
                  <select className="input" value={form.moneda} onChange={e => set("moneda", e.target.value)}>
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, display: "block", marginBottom: 5, fontWeight: 500 }}>Direccion</label>
                <input className="input" value={form.direccion} onChange={e => set("direccion", e.target.value)} placeholder="Ej: Av. Santa Fe 1234, CABA" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5, fontWeight: 500 }}>M2</label>
                  <input className="input" type="number" value={form.m2} onChange={e => set("m2", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 13, display: "block", marginBottom: 5, fontWeight: 500 }}>Ambientes</label>
                  <input className="input" type="number" value={form.ambientes} onChange={e => set("ambientes", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, display: "block", marginBottom: 5, fontWeight: 500 }}>Descripcion</label>
                <textarea className="input" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} rows={3} style={{ resize: "vertical" }} />
              </div>

              <div>
                <label style={{ fontSize: 13, display: "block", marginBottom: 8, fontWeight: 500 }}>Fotos de la propiedad</label>
                {(form.fotos || []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {form.fotos.map((url, i) => (
                      <div key={i} className="foto-contenedor">
                        <img src={url} alt="" className="foto-mini" />
                        <button className="foto-borrar" onClick={() => borrarFoto(url, i)} title="Borrar foto">X</button>
                        {i === 0 && <div style={{ position: "absolute", bottom: 4, left: 4, background: "#2563eb", color: "white", fontSize: 9, padding: "1px 5px", borderRadius: 4, fontWeight: "bold" }}>PRINCIPAL</div>}
                      </div>
                    ))}
                  </div>
                )}
                <input ref={inputFotoRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => subirFotos(e.target.files)} />
                <div
                  className={"zona-fotos" + (arrastrando ? " arrastrando" : "")}
                  onClick={() => !subiendo && inputFotoRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setArrastrando(true); }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={e => { e.preventDefault(); setArrastrando(false); subirFotos(e.dataTransfer.files); }}
                >
                  {subiendo ? (
                    <div>
                      <p style={{ color: "#2563eb", fontWeight: 600, marginBottom: 8 }}>Subiendo fotos... {progresoFoto}%</p>
                      <div className="barra-progreso">
                        <div className="barra-relleno" style={{ width: progresoFoto + "%" }} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: "#6b7280", marginBottom: 4 }}>Arrrastrar fotos o hacer clic para seleccionar</p>
                      <p style={{ fontSize: 12, color: "#9ca3af" }}>JPG, PNG, WEBP - maximo 8MB por foto</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button className="btn btn-azul" onClick={guardar} disabled={guardando || subiendo}>
                {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear propiedad"}
              </button>
              <button className="btn btn-gris" onClick={() => setModal(false)} disabled={subiendo}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- PUBLICAR -----------------------------------------------------------------

function Publicar({ propiedades, portalesConfig, recargar, mostrarAviso }) {
  const [propSel, setPropSel]         = useState(null);
  const [portalesSel, setPortalesSel] = useState([]);
  const [publicando, setPublicando]   = useState(false);

  const portalesActivos = portalesConfig.filter(p => p.activo);

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
        <div className="card" style={{ background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 20 }}>
          <p style={{ color: "#92400e", fontWeight: 600, marginBottom: 4 }}>No tenes portales configurados todavia</p>
          <p style={{ color: "#78350f", fontSize: 14 }}>Ve a la seccion "Portales" para conectar tus cuentas de Mercado Libre, Zonaprop, Airbnb y los demas.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 14, color: "#374151" }}>1. Elige la propiedad</h3>
          {propiedades.length === 0 && (
            <div className="card" style={{ color: "#9ca3af", textAlign: "center", padding: 24 }}>
              No hay propiedades. Primero crea una en la seccion Propiedades.
            </div>
          )}
          {propiedades.map(p => (
            <div key={p.id} onClick={() => setPropSel(p.id)} className="card" style={{ cursor: "pointer", border: propSel === p.id ? "2px solid #2563eb" : "1px solid #e5e7eb", background: propSel === p.id ? "#eff6ff" : "white", marginBottom: 10, padding: 14 }}>
              <div style={{ display: "flex", gap: 12 }}>
                {(p.fotos || []).length > 0 && (
                  <img src={p.fotos[0]} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                )}
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
              const config = portalesConfig.find(c => c.id === p.id);
              const estaActivo = config && config.activo;
              return (
                <div key={p.id} onClick={() => estaActivo && togglePortal(p.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6", cursor: estaActivo ? "pointer" : "not-allowed", opacity: estaActivo ? 1 : 0.45 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                      {!estaActivo && <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}>(no configurado)</span>}
                    </div>
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
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>RESUMEN</div>
              {(prop.fotos || []).length > 0 && (
                <img src={prop.fotos[0]} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />
              )}
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{prop.titulo}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{prop.operacion} - {prop.tipo}</div>
              {prop.precio > 0 && <div style={{ fontSize: 15, color: "#2563eb", fontWeight: 700, marginTop: 6 }}>{prop.moneda === "USD" ? "USD" : "$"} {prop.precio.toLocaleString()}</div>}
              <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>
                Se publicara en {portalesSel.length} portal(es)
                {(prop.fotos || []).length > 0 && " con " + prop.fotos.length + " foto(s)"}
              </div>
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

// --- PORTALES -----------------------------------------------------------------

function Portales({ portalesConfig, recargar, mostrarAviso }) {
  const [guardando, setGuardando] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [forms, setForms] = useState({});

  useEffect(() => {
    const inicial = {};
    portalesConfig.forEach(p => {
      inicial[p.id] = { app_id: p.app_id || "", secret_key: p.secret_key || "", access_token: p.access_token || "" };
    });
    setForms(inicial);
  }, [portalesConfig]);

  const setField = (portalId, campo, valor) => {
    setForms(prev => ({ ...prev, [portalId]: { ...prev[portalId], [campo]: valor } }));
  };

  const guardarPortal = async (portalId, activar) => {
    setGuardando(portalId);
    const f = forms[portalId] || {};
    const tieneCredenciales = f.app_id || f.secret_key || f.access_token;
    const nuevoActivo = activar !== undefined ? activar : tieneCredenciales;
    await supabase.from("portal_config").update({
      app_id: f.app_id || "",
      secret_key: f.secret_key || "",
      access_token: f.access_token || "",
      activo: nuevoActivo,
      actualizado: new Date().toISOString().split("T")[0]
    }).eq("id", portalId);
    await recargar();
    setGuardando(null);
    mostrarAviso("Configuracion de " + PORTALES.find(p => p.id === portalId).nombre + " guardada");
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

      <div className="card" style={{ background: portalesActivos > 0 ? "#f0fdf4" : "#fffbeb", border: "1px solid " + (portalesActivos > 0 ? "#86efac" : "#fde68a"), marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: portalesActivos > 0 ? "#16a34a" : "#f59e0b", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: "bold", flexShrink: 0 }}>
            {portalesActivos}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: portalesActivos > 0 ? "#166534" : "#92400e" }}>
              {portalesActivos === 0 ? "Ningun portal configurado todavia" : portalesActivos + " portal(es) activo(s)"}
            </div>
            <div style={{ fontSize: 13, color: portalesActivos > 0 ? "#15803d" : "#78350f", marginTop: 2 }}>
              {portalesActivos === 0 ? "Completa las credenciales de al menos un portal para poder publicar" : "Podes publicar tus propiedades en estos portales desde la seccion Publicar"}
            </div>
          </div>
        </div>
      </div>

      {PORTALES.map(portal => {
        const config = portalesConfig.find(c => c.id === portal.id) || {};
        const f = forms[portal.id] || {};
        const abierto = expandido === portal.id;

        return (
          <div key={portal.id} className={"portal-card" + (config.activo ? " conectado" : "")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: portal.color, flexShrink: 0 }} />
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
                <button className="btn btn-gris" onClick={() => setExpandido(abierto ? null : portal.id)} style={{ fontSize: 13 }}>
                  {abierto ? "Cerrar" : "Configurar"}
                </button>
              </div>
            </div>

            {abierto && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #e5e7eb" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Como obtener las credenciales:</div>
                  {portal.instrucciones.split("\n").map((linea, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{linea}</div>
                  ))}
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  {portal.id === "mercadolibre" && (
                    <>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>App ID (Client ID)</label>
                        <input className="input" type="text" value={f.app_id || ""} onChange={e => setField(portal.id, "app_id", e.target.value)} placeholder="Ej: 123456789" />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 5 }}>Secret Key (Client Secret)</label>
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
                      <input className="input" type="password" value={f.access_token || ""} onChange={e => setField(portal.id, "access_token", e.target.value)} placeholder={"Tu token de acceso de " + portal.nombre} />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button className="btn btn-verde" onClick={() => guardarPortal(portal.id)} disabled={guardando === portal.id}>
                    {guardando === portal.id ? "Guardando..." : "Guardar y activar"}
                  </button>
                  <button className="btn btn-gris" onClick={() => setExpandido(null)}>Cancelar</button>
                </div>

                {config.activo && (
                  <div style={{ marginTop: 14, padding: "10px 14px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #86efac", fontSize: 13, color: "#166534" }}>
                    Este portal esta activo y listo para publicar. Cuando Mercado Libre u otros portales requieran autorizar la app, te van a mostrar un link para hacerlo.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
