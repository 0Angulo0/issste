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
      email: "Escribe un correo válido, por ejemplo nombre@issste.gob.mx",
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
    bitacora: "Bitácora",
  },
  app: {
    nombre: "Padrón Infantil",
    institucion: "ISSSTE · Estancias para el Bienestar y Desarrollo Infantil",
    logo_alt: "Gobierno de México",
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
      "Esta cuenta todavía no tiene contraseña. Primero créala con tu clave.",
    clave_invalida:
      "La clave no es válida o ya se usó. Revísala o pide una clave nueva a tu estancia o a la administración.",
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
      "Escribe la clave que te entregaron y crea una contraseña. Solo tendrás que hacerlo una vez. Familias: la clave la da la estancia (PI-…). Personal: la da la administración (AC-…).",
    clave: "Clave de acceso",
    clave_ayuda: "Ejemplo: PI-7K3M9Q o AC-7H4K2M",
    nueva: "Nueva contraseña",
    confirmar: "Confirma tu contraseña",
    guardar: "Crear contraseña",
    guardando: "Guardando…",
    exito:
      "Contraseña creada correctamente. Ahora inicia sesión con tu nueva contraseña.",
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
  //? Pantalla 2: infantes (src/roles/estancia/infantes)
  infantes: {
    registrar: "Registrar infante",
    buscar: "Buscar",
    buscar_ayuda: "Escribe nombre, apellido o expediente",
    nombre_completo: "Nombre",
    edad: "Edad",
    acciones: "Acciones",
    ver: "Ver expediente",
    ver_curvas: "Ver curvas",
    datos_generales: "Datos generales",
    tutor: "Padre, madre o tutor",
    clave_familia: "Clave de acceso de la familia",
    seccion_infante: "Datos de la niña o niño",
    seccion_tutor: "Padre, madre o tutor",
    fecha_ayuda: "Escribe día, mes y año.",
    ciudad_ayuda: "Solo la ciudad, por ejemplo Ciudad de México.",
    aviso_clave:
      "Al guardar se creará una clave de acceso para que la familia consulte los datos de su hija o hijo.",
    registrado: "Infante registrado. Clave de acceso para la familia:",
    entrega_clave:
      "Entrégala al padre, madre o tutor. Con ella creará su contraseña en «¿Es tu primera vez?» de la pantalla de inicio de sesión.",
    sexo: { F: "Niña", M: "Niño" },
    filtrar_estancia: "Estancia (EBDI)",
    errores: {
      nacimiento_futuro: "La fecha de nacimiento no puede ser posterior a hoy",
      faltan_datos: "Faltan datos obligatorios. Revisa el formulario.",
    },
  },
  //? Pantalla 2: captura de medidas (src/roles/estancia/mediciones)
  mediciones: {
    capturar: "Capturar medidas",
    nueva: "Nueva medición",
    historial: "Mediciones",
    sin_mediciones: "Aún no hay mediciones registradas.",
    guardadas: "Medidas guardadas correctamente",
    filtrar_infante: "Filtrar por infante",
    infante_ayuda: "Escribe el nombre para buscarlo.",
    antes_de_guardar: "Antes de guardar",
    ayuda: {
      fecha: "Escribe día, mes y año.",
      peso: "Usa punto decimal. Ejemplo: 14.4",
      talla: "Mide de pie si ya camina sin ayuda; si no, acostado.",
      perimetro: "Mide alrededor de la frente.",
    },
    recordatorios: {
      fecha: "Revisa que la fecha sea la de hoy.",
      ropa: "Pesa a la niña o niño sin zapatos ni ropa gruesa.",
      decimal: "Confirma que los números tengan punto decimal.",
    },
    errores: {
      rango_campo:
        "Debe estar entre %{min} y %{max} %{unidad}. Revisa el número y el punto decimal.",
      rango: "Alguna medida está fuera del rango esperado. Revisa los números.",
      fecha: "Escribe una fecha válida",
      futura: "La fecha no puede ser posterior a hoy",
      antes_nacimiento: "La fecha no puede ser anterior al nacimiento",
      infante: "Elige un infante válido",
      repetida:
        "Ya hay una medición de este infante en esa fecha. Si hay un error, pide una corrección a la administración.",
    },
  },
  //? Inicio del personal de estancia
  inicio_estancia: {
    saludo: "Hola, %{nombre}. Resumen de %{periodo}.",
    infantes: "Niñas y niños inscritos",
    mediciones_mes: "Mediciones este mes",
    pendientes: "Pendientes de medir este mes",
    alertas: "Con alerta nutricional",
    pendientes_titulo: "Pendientes de medir este mes",
    sin_pendientes: "Todas las niñas y niños ya tienen medición este mes.",
  },
  //? Pantalla 3: gráficas (src/components/graficas)
  graficas: {
    titulo_estancia: "Curvas de crecimiento",
    titulo_familia: "Gráficas de crecimiento",
    elegir_infante: "Infante",
    elegir_infante_ayuda: "Elige a la niña o niño para ver sus curvas.",
    elige_para_ver: "Elige un infante para ver sus curvas de crecimiento.",
    indicador: "Indicador",
    indicadores: {
      peso: "Peso para la edad",
      talla: "Talla para la edad",
      perimetroCefalico: "Perímetro cefálico para la edad",
      pesoTalla: "Peso para la talla",
      imc: "IMC para la edad",
    },
    eje_edad: "Edad (meses)",
    eje_talla: "Talla (cm)",
    p3: "Percentil 3",
    p50: "Percentil 50",
    p97: "Percentil 97",
    esperado: "Lo esperado",
    leyenda: "Leyenda",
    leyenda_p97: "P97 · guiones y cuadrado",
    leyenda_p50: "P50 · línea continua y círculo",
    leyenda_p3: "P3 · punteada y triángulo",
    leyenda_infante: "%{nombre} · rombo",
    leyenda_esperado: "Lo esperado para su edad · línea con guiones",
    leyenda_hijo: "%{nombre} · línea azul con círculos",
    descripcion:
      "Gráfica de %{indicador} de %{nombre}. Última medición: %{valor}, percentil %{percentil}. Las líneas de referencia son los percentiles 3, 50 y 97 de los CDC.",
    sin_mediciones: "Todavía no hay mediciones para este indicador.",
    sin_tabla: "Este indicador no aplica para la edad de esta niña o niño.",
    ver_tabla: "Ver como tabla",
    ver_tabla_datos: "Ver tabla de datos",
    ocultar_tabla: "Ocultar tabla",
    col_fecha: "Fecha",
    col_edad: "Edad",
    col_percentil: "Percentil",
    nota_cdc:
      "Referencias: tablas de crecimiento de los CDC. Entre los percentiles 3 y 97 se considera dentro de lo esperado.",
    nota_familia:
      "Si la línea de su hija o hijo va cerca de la línea con guiones, va creciendo como se espera.",
  },
  //? Estado nutricional (src/components/EstadoNutricional.tsx)
  nutricion: {
    titulo: {
      adecuado: "Peso adecuado para su edad",
      bajo: "Peso bajo",
      sobrepeso: "Sobrepeso",
      obesidad: "Obesidad",
      alto: "Peso alto para su talla",
      sin_dato: "Sin datos suficientes",
      talla_baja: "Talla baja",
    },
    estado: {
      adecuado: "Adecuado",
      bajo: "Bajo",
      sobrepeso: "Sobrepeso",
      obesidad: "Obesidad",
      alto: "Alto",
      sin_dato: "Sin datos",
    },
    personal: {
      adecuado:
        "La última medición de %{nombre} está dentro de lo esperado según los CDC.",
      bajo: "El peso de %{nombre} está por debajo de lo esperado. Valora referirlo a revisión médica.",
      sobrepeso:
        "El IMC de %{nombre} está entre los percentiles 85 y 95 (sobrepeso). Da seguimiento.",
      obesidad:
        "El IMC de %{nombre} está en el percentil 95 o más (obesidad). Valora referirlo a revisión médica.",
      alto: "El peso para la talla de %{nombre} está por arriba del percentil 97. Da seguimiento.",
      sin_dato: "No hay datos suficientes para clasificar a %{nombre}.",
      talla_baja:
        "Talla baja: la estatura está por debajo del percentil 3 para su edad.",
    },
    familia: {
      adecuado:
        "El peso de %{nombre} va como se espera para su edad. Sigan con sus revisiones en la estancia.",
      bajo: "El peso de %{nombre} está por debajo de lo esperado. Platiquen con el personal de la estancia o con su médico.",
      sobrepeso:
        "El peso de %{nombre} está un poco por arriba de lo esperado. Platiquen con el personal de la estancia.",
      obesidad:
        "El peso de %{nombre} está por arriba de lo esperado. Les recomendamos platicar con su médico.",
      alto: "El peso de %{nombre} está por arriba de lo esperado para su estatura. Platiquen con el personal de la estancia.",
      sin_dato: "Todavía no hay mediciones de %{nombre}.",
      talla_baja:
        "La estatura de %{nombre} está por debajo de lo esperado para su edad. Platiquen con su médico.",
    },
  },
  //? Restablecer acceso (src/components/BotonRestablecer.tsx)
  restablecer: {
    boton_familia: "Restablecer acceso de la familia",
    boton_personal: "Restablecer contraseña",
    titulo: "¿Restablecer acceso?",
    contenido:
      "Se generará una clave nueva para %{nombre}, la contraseña actual dejará de funcionar y se cerrarán sus sesiones abiertas.",
    confirmar: "Sí, restablecer",
    listo: "Acceso restablecido. Clave nueva:",
    instrucciones_familia:
      "Entrégala a la familia; con ella creará su contraseña nueva en «¿Es tu primera vez?».",
    instrucciones_personal:
      "Entrégala a la persona; con ella creará su contraseña nueva en «¿Es tu primera vez?».",
  },
  //? Pantalla 4: padre, madre o tutor (src/roles/tutor)
  tutor: {
    crecimiento_de: "Crecimiento de %{nombre}",
    elegir_hijo: "Hija o hijo",
    elegir_hijo_ayuda: "Elige de quién quieres ver los datos.",
    medicion_reciente: "Medición reciente",
    medida_el: "Medida el %{fecha}",
    peso: "Peso",
    talla: "Talla",
    edad: "Edad",
    peso_tiempo: "Peso de %{nombre} a lo largo del tiempo",
    explicacion_grafica:
      "La línea azul muestra el peso de %{nombre}. La línea con guiones es el peso esperado. Si van cerca, es buena señal.",
    ver_historial: "Ver historial",
    historial_de: "Historial de mediciones de %{nombre}",
    sin_hijos:
      "No hay niñas o niños asociados a tu cuenta. Acude a tu estancia.",
    col_estado: "Estado",
  },
  //? Pantallas 5 y 6: paneles de coordinación y administración
  panel: {
    indicadores_region: "Indicadores de la región",
    panel_general: "Panel general",
    filtros: "Filtros",
    estancia: "Estancia (EBDI)",
    todas_estancias: "Todas las estancias",
    periodo: "Periodo",
    periodo_ayuda: "Mes y año",
    region: "Región",
    todas_regiones: "Todas las regiones",
    entidad: "Estado",
    todas_entidades: "Todos los estados",
    aplicar: "Aplicar filtros",
    aplicados: "Filtros aplicados: %{filtros}.",
    atendidos: "Niñas y niños atendidos",
    registrados: "Niñas y niños registrados",
    captura_al_dia: "Estancias con captura al día",
    captura_al_dia_pct: "Captura al día",
    con_alerta: "Con alerta nutricional",
    de: "%{a} de %{b}",
    cumplimiento: "Cumplimiento de captura",
    col_estancia: "Estancia",
    col_ultima: "Última captura",
    col_estado: "Estado",
    col_captura: "Estado de captura",
    col_infantes: "Infantes",
    col_alertas: "Con alerta",
    col_accion: "Acción",
    al_dia: "Al día",
    pendiente: "Pendiente",
    sin_captura: "Sin capturas",
    ver_detalle: "Ver detalle",
    estado_nutricional: "Estado nutricional (%)",
    porcentaje: "Porcentaje",
    por_region: "Niñas y niños registrados por región",
    alertas_region: "Con alerta nutricional por región",
    cantidad: "Cantidad",
    descargar_regional: "Descargar reporte regional",
    descargar: "Descargar reporte",
    cargando: "Cargando indicadores…",
    alertas_titulo: "Niñas y niños con alerta",
    sin_alertas: "No hay niñas o niños con alerta en este periodo.",
    datos_estancia: "Datos de la estancia",
    infantes_estancia: "Niñas y niños de la estancia",
    tipo: "Tipo",
  },
  //? Reportes (src/components/paneles/Reportes.tsx)
  reportes: {
    titulo: "Reportes",
    titulo_regional: "Reportes regionales",
    descripcion:
      "Descarga los indicadores en un archivo CSV (se abre con Excel u hojas de cálculo). Se descargan con los filtros elegidos.",
    estancias: "Indicadores por estancia",
    alertas: "Niñas y niños con alerta nutricional",
    descargar_estancias: "Descargar indicadores por estancia",
    descargar_alertas: "Descargar lista de alertas",
    descargado: "Reporte descargado",
  },
  //? Pantalla 6: usuarios (src/roles/admin/usuarios)
  usuarios: {
    agregar: "Agregar usuario",
    editar_rol: "Editar rol",
    dar_baja: "Dar de baja",
    reactivar: "Reactivar",
    baja_titulo: "¿Dar de baja a %{nombre}?",
    baja_contenido:
      "Ya no podrá iniciar sesión y se cerrarán sus sesiones abiertas. Sus registros se conservan.",
    baja_lista: "Usuario dado de baja",
    reactivado: "Usuario reactivado",
    estado: "Estado",
    activo: "Activo",
    inactivo: "Inactivo",
    pendiente: "Falta primer acceso",
    acciones: "Acciones",
    creado: "Usuario creado. Clave de activación:",
    entrega_clave:
      "Entrégala a la persona. Con ella creará su contraseña en «¿Es tu primera vez?» de la pantalla de inicio de sesión.",
    aviso_clave:
      "Al guardar se generará una clave de activación; la persona creará su propia contraseña.",
    rol_ayuda: "Define qué puede ver y hacer en el sistema.",
    estancia_ayuda: "Solo para personal de estancia.",
    region_ayuda: "Solo para coordinación regional.",
    guardado: "Cambios guardados",
    errores: {
      datos: "Revisa nombre, correo y rol.",
      correo_repetido: "Ya existe un usuario con ese correo.",
      estancia: "Elige una estancia válida.",
      region: "Elige la región del coordinador.",
      baja_propia: "No puedes darte de baja a ti mismo.",
    },
  },
  //? Pantalla 6: correcciones de registro (src/roles/admin/correcciones)
  correcciones: {
    titulo: "Correcciones de registro",
    corregir: "Corregir",
    corregir_de: "Corregir medición de %{nombre}",
    motivo: "Motivo de la corrección",
    motivo_ayuda: "Explica qué estaba mal. Quedará en la bitácora.",
    aviso:
      "Corrige solo errores de captura. El cambio y su motivo quedan registrados en la bitácora con tu nombre.",
    guardada: "Medición corregida. El motivo quedó en la bitácora.",
    desde: "Desde",
    hasta: "Hasta",
    errores: { motivo: "Escribe el motivo de la corrección" },
  },
  //? Pantalla 6: bitácora (src/roles/admin/bitacora)
  bitacora: {
    titulo: "Bitácora",
    descripcion:
      "Registro de inicios de sesión y de todos los cambios. Solo lectura.",
    filtrar_accion: "Acción",
    acciones: {
      login: "Inicio de sesión",
      login_fallido: "Inicio de sesión fallido",
      primer_acceso: "Primer acceso",
      crear: "Crear",
      editar: "Editar",
      corregir: "Corregir",
      dar_de_baja: "Dar de baja",
      restablecer: "Restablecer acceso",
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
        tutorNombre: "Nombre del padre, madre o tutor",
        tutorCiudad: "Ciudad donde vive",
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
        activo: "Cuenta activa",
        q: "Buscar",
      },
    },
    tutores: {
      name: "Tutor |||| Tutores",
      fields: { nombre: "Nombre", claveAcceso: "Clave de acceso" },
    },
    bitacora: {
      name: "Registro |||| Bitácora",
      fields: {
        fecha: "Fecha y hora",
        nombre: "Usuario",
        rol: "Rol",
        accion: "Acción",
        recurso: "Recurso",
        registroId: "Registro",
        detalle: "Detalle",
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
