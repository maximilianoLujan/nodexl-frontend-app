import apiUrl from "../config/apiConfig";

const getGraph = async () => {
  const res = await fetch(`${apiUrl}/grafo/procesos`);

  if (!res.ok) {
    throw new Error("Error al obtener el grafo");
  }

  return res.json();
};

export default getGraph;
