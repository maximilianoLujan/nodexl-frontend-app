import apiUrl from "../config/apiConfig";

const getPersonas = async () => {
  const res = await fetch(`${apiUrl}/grafo/personas`);

  if (!res.ok) {
    throw new Error("Error al obtener las memorias");
  }

  return res.json();
};

export default getPersonas;
