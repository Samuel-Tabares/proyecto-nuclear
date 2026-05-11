import { z } from "zod";

export const esquemaInicioSesion = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa el correo electrónico.")
    .email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "Ingresa la contraseña."),
});

export type DatosInicioSesion = z.infer<typeof esquemaInicioSesion>;
