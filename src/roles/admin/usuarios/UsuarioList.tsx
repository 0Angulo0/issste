import {
  DataTable,
  List,
  ReferenceField,
  SelectInput,
  TextInput,
  useRecordContext,
  useTranslate,
  WithRecord,
} from "react-admin";
import { Box } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useLocation } from "react-router-dom";
import { EncabezadoPagina } from "../../../components/EncabezadoPagina";
import { BotonEnlace } from "../../../components/BotonEnlace";
import { AvisoEstado } from "../../../components/AvisoEstado";
import { BotonRestablecer } from "../../../components/BotonRestablecer";
import { BotonBaja } from "./BotonBaja";
import { ROLES_PERSONAL } from "./CamposUsuario";
import { colores } from "../../../theme/theme";

/**
 * ? Pantalla 6: gestión de usuarios (borrador del administrador).
 * Acciones con texto: "Editar rol", "Dar de baja" y "Restablecer contraseña".
 * El estado se muestra con icono + texto: Activo, Inactivo o Falta primer acceso.
 */
const filtros = [
  <TextInput key="q" source="q" label="infantes.buscar" alwaysOn />,
  <SelectInput key="rol" source="rol" choices={ROLES_PERSONAL} alwaysOn />,
  <SelectInput
    key="activo"
    source="activo"
    label="usuarios.estado"
    choices={[
      { id: true, name: "usuarios.activo" },
      { id: false, name: "usuarios.inactivo" },
    ]}
    alwaysOn
  />,
];

const Estado = () => {
  const usuario = useRecordContext();
  const translate = useTranslate();
  if (!usuario) return null;
  const [Icono, texto, color] = !usuario.activo
    ? [BlockIcon, "usuarios.inactivo", "#444"]
    : !usuario.tieneContrasena
      ? [HourglassEmptyIcon, "usuarios.pendiente", "#8A4B00"]
      : [CheckCircleOutlineIcon, "usuarios.activo", colores.exito];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        gap: 0.75,
        alignItems: "center",
        fontWeight: 600,
        color,
      }}
    >
      <Icono aria-hidden="true" />
      {translate(texto)}
    </Box>
  );
};

export const UsuarioList = () => {
  const translate = useTranslate();
  const { state } = useLocation();
  return (
    <>
      <EncabezadoPagina
        titulo={translate("resources.usuarios.name", { smart_count: 2 })}
        acciones={
          <BotonEnlace
            to="/usuarios/create"
            label="usuarios.agregar"
            icono={<PersonAddIcon aria-hidden="true" />}
          />
        }
      />
      {state?.claveNueva && (
        <Box sx={{ mb: 2 }}>
          <AvisoEstado tipo="exito">
            {translate("usuarios.creado")}{" "}
            <Box
              component="strong"
              sx={{ fontSize: "1.2rem", letterSpacing: 1 }}
            >
              {state.claveNueva}
            </Box>
            <Box
              component="span"
              sx={{ display: "block", fontWeight: 400, mt: 0.5 }}
            >
              {translate("usuarios.entrega_clave")}
            </Box>
          </AvisoEstado>
        </Box>
      )}
      <List
        filters={filtros}
        sort={{ field: "nombre", order: "ASC" }}
        actions={false}
        title={false}
      >
        <DataTable bulkActionButtons={false} rowClick={false}>
          <DataTable.Col source="nombre" />
          <DataTable.Col source="email" />
          <DataTable.Col
            source="rol"
            render={(r) => translate(`roles.${r.rol}`)}
          />
          <DataTable.Col source="estanciaId">
            <ReferenceField
              source="estanciaId"
              reference="estancias"
              link={false}
            />
          </DataTable.Col>
          <DataTable.Col source="region" />
          <DataTable.Col label="usuarios.estado">
            <Estado />
          </DataTable.Col>
          <DataTable.Col label="usuarios.acciones">
            <WithRecord
              render={(u) => (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <BotonEnlace
                    to={`/usuarios/${u.id}`}
                    label="usuarios.editar_rol"
                    variant="outlined"
                    icono={<EditIcon aria-hidden="true" />}
                  />
                  <BotonBaja />
                  {u.activo && (
                    <BotonRestablecer
                      tipo="usuario"
                      cuentaId={Number(u.id)}
                      nombre={u.nombre}
                      etiqueta="restablecer.boton_personal"
                    />
                  )}
                </Box>
              )}
            />
          </DataTable.Col>
        </DataTable>
      </List>
    </>
  );
};
