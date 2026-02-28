import apiUrl from "../config/apiConfig";

const importMemories = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file); // "file" debe coincidir con el nombre esperado por el backend

  const res = await fetch(`${apiUrl}/import/pdf`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Error al importar PDF");
  }

  return res.json();
};

export default importMemories;
