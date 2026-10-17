import { Title, useTranslate } from "react-admin";
import { Card, CardContent, Typography } from "@mui/material";

/**
 * Pantalla temporal mientras se construye cada vista.
 * Se irá reemplazando pantalla por pantalla (ver CLAUDE.md).
 */
export const EnConstruccion = ({ titulo }: { titulo: string }) => {
  const translate = useTranslate();
  return (
    <Card sx={{ mt: 2 }}>
      {/* <Title> pone el título en la barra y en la pestaña del navegador */}
      <Title title={titulo} />
      <CardContent>
        <Typography variant="h1" component="h1" gutterBottom>
          {titulo}
        </Typography>
        <Typography>{translate("app.en_construccion")}</Typography>
      </CardContent>
    </Card>
  );
};
