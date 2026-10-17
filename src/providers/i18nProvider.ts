import polyglotI18nProvider from "ra-i18n-polyglot";
import type { TranslationMessages } from "react-admin";

export const spanishMessages = {
  ra: {
    action: {
      add: "Agregar",
      back: "Regresar",
      bulk_actions:
        "1 elemento seleccionado |||| %{smart_count} elementos seleccionados",
      cancel: "Cancelar",
      clear_input_value: "Limpiar valor",
      confirm: "Confirmar",
      create: "Crear",
      create_item: "Crear %{item}",
      delete: "Eliminar",
      edit: "Editar",
      export: "Exportar",
      list: "Lista",
      refresh: "Actualizar",
      remove: "Quitar",
      reset: "Restablecer",
      save: "Guardar",
      search: "Buscar",
      select_all: "Seleccionar todo",
      select_all_button: "Seleccionar todo",
      select_row: "Seleccionar esta fila",
      show: "Mostrar",
      sort: "Ordenar",
      undo: "Deshacer",
      unselect: "Deseleccionar",
      close: "Cerrar",
      open_menu: "Abrir menú",
      close_menu: "Cerrar menú",
      update: "Actualizar",
      open: "Abrir",
      toggle_theme: "Cambiar modo claro/oscuro",
      update_application: "Recargar aplicación",
      add_filter: "Añadir filtro",
    },
    boolean: {
      true: "Sí",
      false: "No",
      null: " ",
    },
    page: {
      create: "Crear %{name}",
      dashboard: "Panel principal",
      edit: "%{name} %{recordRepresentation}",
      error: "Algo salió mal",
      list: "%{name}",
      loading: "Cargando",
      not_found: "No encontrado",
      show: "%{name} %{recordRepresentation}",
      empty: "Todavía no hay %{name}.",
      invite: "¿Deseas agregar uno?",
      access_denied: "Acceso denegado",
      authentication_error: "Error de autenticación",
    },
    input: {
      references: {
        all_missing: "No se encontraron los datos de referencia.",
        many_missing:
          "Al menos una de las referencias asociadas ya no parece estar disponible.",
        single_missing: "La referencia asociada ya no parece estar disponible.",
      },
      password: {
        toggle_visible: "Ocultar contraseña",
        toggle_hidden: "Mostrar contraseña",
      },
    },
    message: {
      about: "Acerca de",
      access_denied:
        "No tienes los permisos necesarios para acceder a esta página",
      are_you_sure: "¿Estás seguro?",
      authentication_error:
        "El servidor de autenticación devolvió un error y no se pudieron validar tus credenciales.",
      auth_error: "Ocurrió un error al validar el token de autenticación.",
      bulk_delete_content:
        "¿Estás seguro de que quieres eliminar este %{name}? |||| ¿Estás seguro de que quieres eliminar estos %{smart_count} elementos?",
      bulk_delete_title:
        "Eliminar %{name} |||| Eliminar %{smart_count} %{name}",
      bulk_update_content:
        "¿Estás seguro de que quieres actualizar %{name} %{recordRepresentation}? |||| ¿Estás seguro de que quieres actualizar estos %{smart_count} elementos?",
      bulk_update_title:
        "Actualizar %{name} %{recordRepresentation} |||| Actualizar %{smart_count} %{name}",
      delete_content: "¿Estás seguro de que quieres eliminar este %{name}?",
      delete_title: "Eliminar %{name} %{recordRepresentation}",
      details: "Detalles",
      error: "Ocurrió un error y tu solicitud no pudo completarse.",
      invalid_form: "El formulario no es válido. Por favor revisa los errores",
      loading: "Espera un momento por favor",
      no: "No",
      not_found:
        "Escribiste una URL incorrecta, o seguiste un enlace equivocado.",
      select_all_limit_reached:
        "Hay demasiados elementos para seleccionarlos todos. Solo se seleccionaron los primeros %{max} elementos.",
      unsaved_changes:
        "Algunos cambios no se guardaron. ¿Estás seguro de que quieres ignorarlos?",
      yes: "Sí",
      placeholder_data_warning:
        "Problema de red: no se pudo actualizar la información.",
    },
    navigation: {
      clear_filters: "Quitar filtros",
      no_filtered_results:
        "No se encontraron %{name} con los filtros actuales.",
      no_results: "No se encontraron %{name}",
      no_more_results:
        "La página número %{page} está fuera de los límites. Prueba con la página anterior.",
      page_out_of_boundaries:
        "La página número %{page} está fuera de los límites",
      page_out_from_end: "No se puede avanzar después de la última página",
      page_out_from_begin: "No se puede retroceder antes de la página 1",
      page_range_info: "%{offsetBegin}-%{offsetEnd} de %{total}",
      partial_page_range_info:
        "%{offsetBegin}-%{offsetEnd} de más de %{offsetEnd}",
      current_page: "Página %{page}",
      page: "Ir a la página %{page}",
      first: "Ir a la primera página",
      last: "Ir a la última página",
      next: "Ir a la página siguiente",
      previous: "Ir a la página anterior",
      page_rows_per_page: "Filas por página:",
      skip_nav: "Saltar al contenido",
    },
    sort: {
      sort_by: "Ordenar por %{field_lower_first} %{order}",
      ASC: "ascendente",
      DESC: "descendente",
    },
    auth: {
      auth_check_error: "Por favor inicia sesión para continuar",
      user_menu: "Perfil",
      username: "Usuario",
      password: "Contraseña",
      sign_in: "Iniciar sesión",
      sign_in_error: "Error de autenticación, por favor intenta de nuevo",
      logout: "Cerrar sesión",
    },
    notification: {
      updated:
        "Elemento actualizado |||| %{smart_count} elementos actualizados",
      created: "Elemento creado",
      deleted: "Elemento eliminado |||| %{smart_count} elementos eliminados",
      bad_item: "Elemento incorrecto",
      item_doesnt_exist: "El elemento no existe",
      http_error: "Error de comunicación con el servidor",
      data_provider_error:
        "Error del dataProvider. Revisa la consola para más detalles.",
      i18n_error:
        "No se pudieron cargar las traducciones para el idioma especificado",
      canceled: "Acción cancelada",
      logged_out: "Tu sesión ha terminado, por favor vuelve a conectarte.",
      not_authorized: "No estás autorizado para acceder a este recurso.",
      application_update_available: "Hay una nueva versión disponible.",
      offline: "Sin conexión. No se pudo obtener la información.",
    },
    validation: {
      required: "Este campo es obligatorio",
    },
  },
  //? llaves propias del Padrón Infantil (menú, roles y pantallas),
  //? se usan con useTranslate() o se pasan como texto a los componentes
  roles: {
    admin: "Administrador",
    coordinador: "Coordinador regional",
    estancia: "Personal de estancia",
    tutor: "Padre, madre o tutor",
  },
  menu: {
    inicio: "Inicio",
    graficas: "Gráficas",
    historial: "Historial de mediciones",
    reportes: "Reportes",
    cumplimiento: "Cumplimiento de captura",
    correcciones: "Correcciones de registro",
  },
  app: {
    nombre: "Padrón Infantil",
    institucion: "ISSSTE · Estancias para el Bienestar y Desarrollo Infantil",
    logo_alt: "Gobierno de México",
    en_construccion: "Esta pantalla se construirá en un siguiente paso.",
    region_fija: "Región fija: %{region}",
  },
  //? llaves propias para los errores de autorizacion,
  //? que no se traducen solas por ser componentes mui
  auth: {
    login_failed: "Usuario o contraseña incorrectos",
    invalid_credentials: "Credenciales inválidas, por favor intenta de nuevo",
    session_expired: "Tu sesión ha expirado, inicia sesión de nuevo",
    auth_required: "Debes iniciar sesión para continuar",
    //^ respuestas de server/server.js
    primer_acceso_pendiente:
      "Esta clave todavía no tiene contraseña. Primero crea tu contraseña.",
    clave_invalida:
      "La clave no es válida o ya se usó. Revisa la clave o pide ayuda en tu estancia.",
    contrasena_insegura:
      "La contraseña no es segura. Revisa los requisitos marcados con ✗.",
    demasiados_intentos:
      "Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.",
  },
  //? Pantalla 1: inicio de sesión (src/pages/LoginPage.tsx)
  login: {
    titulo: "Iniciar sesión",
    usuario: "Correo o clave de acceso",
    usuario_ayuda:
      "Personal: tu correo institucional. Familias: la clave que te dio la estancia, por ejemplo PI-7K3M9Q.",
    contrasena: "Contraseña",
    ingresar: "Ingresar",
    ingresando: "Ingresando…",
    primer_acceso: "¿Es tu primera vez? Crea tu contraseña con tu clave",
    ir_primer_acceso: "Crear mi contraseña",
    olvide: "¿Olvidaste tu contraseña?",
    olvide_ayuda:
      "Personal: pide a la administración que restablezca tu contraseña. Familias: acude a tu estancia para que te generen una clave nueva.",
    errores: {
      correo: "Escribe un correo válido, por ejemplo nombre@issste.gob.mx",
      clave: "La clave tiene el formato PI- seguido de 6 letras o números",
    },
  },
  //? Primer acceso del tutor (src/pages/PrimerAcceso.tsx)
  primer_acceso: {
    titulo: "Crear mi contraseña",
    instrucciones:
      "Escribe la clave de acceso que te entregó la estancia y crea una contraseña. Solo tendrás que hacerlo una vez.",
    clave: "Clave de acceso",
    clave_ayuda: "Ejemplo: PI-7K3M9Q",
    nueva: "Nueva contraseña",
    confirmar: "Confirma tu contraseña",
    guardar: "Crear contraseña",
    guardando: "Guardando…",
    exito:
      "Contraseña creada correctamente. Ahora inicia sesión con tu clave y tu nueva contraseña.",
    volver: "Volver a iniciar sesión",
  },
  //? Requisitos de contraseña (src/utils/reglasContrasena.js)
  contrasena: {
    titulo: "Tu contraseña debe:",
    resumen: "Cumples %{cumplidas} de %{total} requisitos.",
    cumple: "cumple",
    falta: "falta",
    al_guardar: "se revisa al guardar",
    mostrar: "Mostrar",
    ocultar: "Ocultar",
    reglas: {
      longitud: "Tener al menos 8 caracteres",
      mayuscula: "Tener al menos una letra mayúscula",
      minuscula: "Tener al menos una letra minúscula",
      numero: "Tener al menos un número",
      especial: "Tener al menos un carácter especial (por ejemplo ! # $ %)",
      espacios: "No tener espacios",
      comun: "No ser una contraseña común (como «password» o «qwerty»)",
      personales:
        "No contener tu nombre, el de tu hija o hijo, fechas importantes ni tu ciudad",
    },
    errores: {
      no_cumple: "La contraseña todavía no cumple todos los requisitos",
      no_coincide: "Las contraseñas no coinciden",
    },
  },
  resources: {
    infantes: {
      name: "Infante |||| Infantes",
      fields: {
        id: "ID",
        nombre: "Nombre",
        apellidos: "Apellidos",
        fechaNacimiento: "Fecha de nacimiento",
        sexo: "Sexo",
        expediente: "Expediente",
        estanciaId: "Estancia (EBDI)",
        tutorId: "Tutor",
        q: "Buscar",
      },
    },
    mediciones: {
      name: "Medición |||| Mediciones",
      fields: {
        id: "ID",
        infanteId: "Infante",
        fecha: "Fecha de medición",
        peso: "Peso (kg)",
        talla: "Talla (cm)",
        perimetroCefalico: "Perímetro cefálico (cm)",
        registradoPor: "Registrado por",
      },
    },
    estancias: {
      name: "Estancia |||| Estancias",
      fields: {
        id: "ID",
        numero: "Número",
        nombre: "Nombre",
        tipo: "Tipo",
        estado: "Estado",
        region: "Región",
      },
    },
    usuarios: {
      name: "Usuario |||| Usuarios",
      fields: {
        id: "ID",
        nombre: "Nombre",
        email: "Correo",
        rol: "Rol",
        estanciaId: "Estancia (EBDI)",
        region: "Región",
        activo: "Activo",
        q: "Buscar",
      },
    },
  },
};

export const i18nProvider = polyglotI18nProvider(
  // ra-i18n-polyglot solo acepta TranslationMessages (todas las llaves
  // oficiales), pero en runtime funciona bien con un subconjunto: si
  // alguna llave que quitamos llegara a pedirse, react-admin muestra
  // la llave tal cual en vez de tronar.
  () => spanishMessages as unknown as TranslationMessages,
  "es",
);
