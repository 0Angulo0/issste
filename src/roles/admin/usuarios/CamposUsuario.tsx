import {
  FormDataConsumer,
  ReferenceInput,
  SelectInput,
  TextInput,
  email,
  required,
  useGetList,
} from "react-admin";

/**
 * ? Campos del formulario de usuario (alta y edición).
 * Según el rol se pide la estancia (personal de estancia) o la región
 * (coordinación). FormDataConsumer muestra solo el campo que corresponde.
 */
export const ROLES_PERSONAL = [
  { id: "estancia", name: "roles.estancia" },
  { id: "coordinador", name: "roles.coordinador" },
  { id: "admin", name: "roles.admin" },
];

export const CamposUsuario = () => {
  //^ las regiones salen de las estancias registradas
  const { data: estancias = [] } = useGetList("estancias", {
    pagination: { page: 1, perPage: 500 },
  });
  const regiones = [...new Set(estancias.map((e) => e.region))]
    .sort()
    .map((r) => ({ id: r, name: r }));

  return (
    <>
      <TextInput source="nombre" validate={required()} fullWidth />
      <TextInput
        source="email"
        type="email"
        validate={[required(), email()]}
        autoComplete="off"
        fullWidth
      />
      <SelectInput
        source="rol"
        choices={ROLES_PERSONAL}
        validate={required()}
        helperText="usuarios.rol_ayuda"
        fullWidth
      />
      <FormDataConsumer>
        {({ formData }) =>
          formData.rol === "estancia" ? (
            <ReferenceInput source="estanciaId" reference="estancias">
              <SelectInput
                optionText="nombre"
                validate={required()}
                helperText="usuarios.estancia_ayuda"
                fullWidth
              />
            </ReferenceInput>
          ) : formData.rol === "coordinador" ? (
            <SelectInput
              source="region"
              choices={regiones}
              validate={required()}
              helperText="usuarios.region_ayuda"
              fullWidth
            />
          ) : null
        }
      </FormDataConsumer>
    </>
  );
};

/** Limpia campos que no aplican al rol antes de guardar. */
export const prepararUsuario = (datos: Record<string, unknown>) => ({
  ...datos,
  estanciaId: datos.rol === "estancia" ? datos.estanciaId : null,
  region: datos.rol === "admin" ? null : datos.region,
});
