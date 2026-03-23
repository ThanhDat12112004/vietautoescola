export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL environment variable");
}

const ERROR_TRANSLATIONS = {
  "Request failed": {
    vi: "Yeu cau that bai",
    es: "Solicitud fallida",
  },
  Unauthorized: {
    vi: "Chua dang nhap",
    es: "No autorizado",
  },
  "Invalid token": {
    vi: "Token khong hop le",
    es: "Token invalido",
  },
  "Invalid credentials": {
    vi: "Email hoac mat khau khong dung",
    es: "Correo o contrasena incorrectos",
  },
  "Account is disabled": {
    vi: "Tai khoan da bi vo hieu hoa",
    es: "La cuenta esta deshabilitada",
  },
  "Account is not available": {
    vi: "Tai khoan khong kha dung",
    es: "La cuenta no esta disponible",
  },
  "Session expired on this device": {
    vi: "Phien dang nhap tren thiet bi nay da het han",
    es: "La sesion de este dispositivo ha expirado",
  },
  "Account is already logged in on another device": {
    vi: "Tai khoan dang dang nhap o thiet bi khac",
    es: "La cuenta ya inicio sesion en otro dispositivo",
  },
  "Missing device id": {
    vi: "Thieu dinh danh thiet bi",
    es: "Falta el identificador del dispositivo",
  },
  Forbidden: {
    vi: "Ban khong co quyen thuc hien thao tac nay",
    es: "No tienes permiso para realizar esta accion",
  },
  "User not found": {
    vi: "Khong tim thay nguoi dung",
    es: "Usuario no encontrado",
  },
  "Quiz not found": {
    vi: "Khong tim thay de thi",
    es: "Examen no encontrado",
  },
  "Material not found": {
    vi: "Khong tim thay tai lieu",
    es: "Material no encontrado",
  },
  "Username or email already exists": {
    vi: "Ten dang nhap hoac email da ton tai",
    es: "El usuario o correo ya existe",
  },
};

function localizeErrorMessage(message, lang) {
  const normalizedLang = lang === "vi" ? "vi" : "es";
  const translated = ERROR_TRANSLATIONS[message];
  if (!translated) {
    return message;
  }

  return translated[normalizedLang] || message;
}

export async function apiFetch(path, options = {}) {
  const { lang, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(lang ? { "Accept-Language": lang, "x-lang": lang } : {}),
      ...(requestOptions.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fallbackLang = typeof window !== "undefined" ? window.localStorage.getItem("lang") || "es" : "es";
    const resolvedLang = lang || fallbackLang;
    throw new Error(localizeErrorMessage(data.message || "Request failed", resolvedLang));
  }

  return data;
}
