import { MdMemory } from "react-icons/md";
import { FiUpload, FiGrid, FiList } from "react-icons/fi";

export default function Header() {
  return (
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
        <button className="
          flex items-center gap-2
          bg-teal-500 hover:bg-teal-400
          text-slate-900 font-medium
          px-4 py-2 rounded-lg
          w-full md:w-auto
        ">
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
  );
}
