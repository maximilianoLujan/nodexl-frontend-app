import apiUrl from "../config/apiConfig";

const getMemories = async () => {
  const res = await fetch(`${apiUrl}/memories`);

  if (!res.ok) {
    throw new Error("Error al obtener las memorias");
  }

  return res.json();
};

export default getMemories;
