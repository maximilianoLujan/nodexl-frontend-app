import apiUrl from "../config/apiConfig";

const getCategories = async () => {
  const res = await fetch(`${apiUrl}/categories`);

  if (!res.ok) {
    throw new Error("Error al obtener las memorias");
  }

  return res.json();
};

export default getCategories;
