import { useEffect, useState } from "react";
import { MdMemory } from "react-icons/md";
import { FiUpload, FiX, FiLoader, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import importMemories from "../../services/importerService";
import { useGraphStore } from "../../store/graphStore";
import getMemories from "../../services/memoriesService";
import type { Memory } from "../../types/MemoryTypes";
import type { Person } from "../../types/Person.types";
import getPersonas from "../../services/personasService";
import { useFilterStore } from "../../store/filterStore";
import { getYearFromFilename } from "../../utils/memoriUtils";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { IoMdPerson } from "react-icons/io";


export default function Header() {
  const { filters, addFilter, removeFilter } = useFilterStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFiles] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const {fetchGraph} = useGraphStore((state) => state);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [personas, setPersonas] = useState < Person[]>([])
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenPersonas,setIsOpenPersonas] = useState(false)

  const selectedMemories = filters
    .filter((f) => f.type === "year")
    .map((f) => f.id);

  const selectedPersons = filters
    .filter((f) => f.type === "person")
    .map((f) => f.id);

  const toggleSelection = (memory: Memory) => {
    const exists = selectedMemories.includes(memory.id);

    const value = getYearFromFilename(memory.filename)

    if(!value) return;

    if (exists) {
      removeFilter({
        id: memory.id,
        type: "year",
        value: value,
        label: memory.filename,
      });
    } else {
      addFilter({
        id: memory.id,
        type: "year",
        value,
        label: memory.filename,
      });
    }
  };

  const togglePerson = (persona: Person) => {
    const exists = selectedPersons.includes(persona.id);

    if (exists) {
      removeFilter({
        id: persona.id,
        type: "person",
        value: persona.label,
        label: persona.label
      });
    } else {
      addFilter({
        id: persona.id,
        type: "person",
        value: persona.label,
        label: persona.label
      });
    }
  };

  const fetchMemories = async () => {
    try {
      const data = await getMemories();
      setMemories(data);
    } catch (error) {
      console.error("Error cargando memorias:", error);
    }
  };


  const fetchPersonas = async () => {
    try {
      const data = await getPersonas();
      setPersonas(data);
    } catch (error) {
      console.error("Error cargando memorias:", error);
    }
  };

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

      if (!response.summary) throw new Error("Error en la subida");

      setUploadStatus("success");
      
      // Refrescamos el grafo globalmente
      fetchGraph();
      fetchMemories()

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

  useEffect(() => {
    fetchMemories()
  }, []);

  useEffect(() => {
    fetchPersonas()
  }, []);

  useEffect(() => {
    const loadSelectedMemories = async () => {
      await fetchGraph()
    };

    loadSelectedMemories();
  }, [filters]);

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
              {memories.length} documentos
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
          <div className="relative w-64">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-slate-800 text-slate-200 text-sm px-4 py-2 rounded-lg border border-slate-700 text-left flex items-center gap-2 hover:bg-slate-700 transition"
            >
              <IoCalendarNumberOutline className="text-teal-400 text-lg" />

              <span>
                {selectedMemories.length === 0
                  ? "Todas las memorias"
                  : `${selectedMemories.length} seleccionadas`}
              </span>
            </button>

            {isOpen && (
              <div
                className="
                  absolute mt-2 w-full
                  bg-slate-900
                  border border-slate-700
                  rounded-lg
                  shadow-lg
                  max-h-60
                  overflow-y-auto
                  scrollbar-dark
                  z-50
                "
              >
                {memories.map((memory) => (
                  <label
                    key={memory.id}
                    className="
                      flex items-center gap-3 px-4 py-2
                      hover:bg-slate-800
                      cursor-pointer
                      transition
                    "
                  >
                    <input
                      type="checkbox"
                      checked={selectedMemories.includes(memory.id)}
                      onChange={() => toggleSelection(memory)}
                      className="
                        h-4 w-4
                        rounded
                        border-slate-600
                        bg-slate-800
                        text-teal-500
                        focus:ring-teal-500
                        focus:ring-2
                      "
                    />
                    <span className="text-slate-200 text-sm">
                      {memory.filename}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-64">
            <button
              onClick={() => setIsOpenPersonas(!isOpenPersonas)}
              className="w-full bg-slate-800 text-slate-200 text-sm px-4 py-2 rounded-lg border border-slate-700 text-left flex items-center gap-2 hover:bg-slate-700 transition"
            >
              <IoMdPerson className="text-teal-400 text-lg" />

              <span>
                {selectedPersons.length === 0
                  ? "Todos los autores"
                  : `${selectedPersons.length} seleccionados`}
              </span>
            </button>

            {isOpenPersonas && (
              <div className="absolute mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-dark z-50">
                {personas.map((persona) => (
                  <label
                    key={persona.id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPersons.includes(persona.id)}
                      onChange={() => togglePerson(persona)}
                      className="
                        h-4 w-4
                        rounded
                        border-slate-600
                        bg-slate-800
                        text-teal-500
                        focus:ring-teal-500
                        focus:ring-2
                      "
                    />

                    <span className="text-slate-200 text-sm">
                      {persona.label}
                    </span>
                  </label>
                ))}

              </div>
            )}
          </div>

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
