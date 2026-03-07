import apiUrl from "../config/apiConfig";

const getGraph = async (filters: string) => {
  const res = await fetch(`${apiUrl}/grafo/procesos${filters}`);

  if (!res.ok) {
    throw new Error("Error al obtener el grafo");
  }

  return res.json();
};

const getGraphProcess = async (id: number) => {
  const res = await fetch(`${apiUrl}/grafo/procesos/${id}`);

  if (!res.ok) {
    throw new Error("Error al obtener el grafo");
  }

  return res.json();
};

export {getGraph, getGraphProcess};
