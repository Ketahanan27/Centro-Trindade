import { createContext, useContext } from "react";

export const PerfilContext = createContext({ perfil: "Membro", soLeitura: false });
export const usePerfil = () => useContext(PerfilContext);
