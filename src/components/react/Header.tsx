import { useState } from "react";
import { MdMemory } from "react-icons/md";
import { FiUpload, FiX, FiLoader, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import importMemories from "../../services/importerService";
import { useGraphStore } from "../../store/graphStore";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFiles] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const fetchGraph = useGraphStore((state) => state.fetchGraph);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const handleUploadPdfs = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus("uploading");
      const response = await importMemories(selectedFile)

      console.log(response)

      if (!response.summary) throw new Error("Error en la subida");

      setUploadStatus("success");
      
      // Refrescamos el grafo globalmente
      fetchGraph();

      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedFiles(null);
        setUploadStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
    }
  };

  const closeModal = () => {
    if (uploadStatus === "uploading") return;
    setIsModalOpen(false);
    setSelectedFiles(null);
    setUploadStatus("idle");
  };

  return (
    <>
      <header className="
        bg-slate-900 border-b border-slate-800
        px-4 py-3
        grid gap-4
        grid-cols-1
        md:grid-cols-3
        md:items-center
      ">

        {/* TOP – Branding */}
        <div className="flex items-center gap-3 order-1">
          <div className="p-2 rounded-lg bg-slate-800">
            <MdMemory size={22} className="text-teal-400" />
          </div>

          <div className="flex flex-col leading-tight">
            <h3 className="text-slate-100 font-semibold text-lg">
              Memorias
            </h3>
            <span className="text-slate-400 text-xs">
              0 documentos
            </span>
          </div>
        </div>

        {/* TOP RIGHT – Importar */}
        <div className="flex justify-end order-2 md:order-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="
              flex items-center gap-2
              bg-teal-500 hover:bg-teal-400
              text-slate-900 font-medium
              px-4 py-2 rounded-lg
              w-full md:w-auto
              cursor-pointer
            "
          >
            <FiUpload />
            Importar
          </button>
        </div>

        {/* BOTTOM – Filtros */}
        <div className="
          flex flex-col gap-3
          order-3
          md:order-2
          md:flex-row
          md:justify-center
        ">
          <select className="bg-slate-800 text-slate-200 text-sm px-4 py-2 rounded-lg border border-slate-700 focus:outline-none">
            <option>Todas las memorias</option>
          </select>

          <select className="bg-slate-800 text-slate-200 text-sm px-4 py-2 rounded-lg border border-slate-700 focus:outline-none">
            <option>Todos los autores</option>
          </select>

        </div>
      </header>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h2 className="text-slate-100 font-semibold text-lg">Importar PDF</h2>
              <button 
                onClick={closeModal}
                disabled={uploadStatus === "uploading"}
                className="text-slate-400 hover:text-slate-100 p-1 disabled:opacity-50"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {uploadStatus === "uploading" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FiLoader className="text-teal-400 animate-spin mb-4" size={48} />
                  <p className="text-slate-100 font-medium">Procesando documentos...</p>
                  <p className="text-slate-400 text-sm mt-1">Esto puede tardar unos segundos, por favor espera.</p>
                </div>
              ) : uploadStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FiCheckCircle className="text-teal-400 mb-4" size={48} />
                  <p className="text-slate-100 font-medium">¡Archivos subidos con éxito!</p>
                  <p className="text-slate-400 text-sm">El modal se cerrará en breve...</p>
                </div>
              ) : (
                <>
                  <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors bg-slate-800/50 group ${
                    uploadStatus === "error" ? "border-red-500/50" : "border-slate-700 hover:border-teal-500/50"
                  }`}>
                    <FiUpload className={`mb-3 ${uploadStatus === "error" ? "text-red-400" : "text-slate-500 group-hover:text-teal-400"}`} size={32} />
                    <p className="text-slate-300 text-sm text-center mb-4">
                      {selectedFile
                        ? `Archivo seleccionado: ${selectedFile.name}` 
                        : "Haz clic para seleccionar o arrastra archivos PDF"}
                    </p>
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-teal-500 file:text-slate-900
                        hover:file:bg-teal-400
                        cursor-pointer"
                    />
                  </div>

                  {uploadStatus === "error" && (
                    <div className="flex items-center gap-2 mt-4 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
                      <FiAlertCircle />
                      <span>Hubo un error al subir los archivos. Inténtalo de nuevo.</span>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={closeModal}
                      className="px-4 py-2 text-slate-300 hover:text-slate-100 text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleUploadPdfs}
                      disabled={!selectedFile}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Subir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
