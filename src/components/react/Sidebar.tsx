import LegendItem from "./LegendItem";
import FilterSection from "./FilterSection";
import FilterItem from "./FilterItem";
import { useFilterStore } from "../../store/filterStore";
import { IoMdPerson } from "react-icons/io";
import { IoCalendarNumberOutline, IoPricetagOutline } from "react-icons/io5";

export default function Sidebar() {
  const { filters, removeFilter } = useFilterStore();

  const yearFilters = filters.filter((f) => f.type === "year");
  const personFilters = filters.filter((f) => f.type === "person");
  const categoryFilters = filters.filter((f) => f.type === "category");

  return (
    <aside className="sidebar h-full bg-slate-900 border-r border-slate-800 flex flex-col p-4">
      <div className="mb-6 max-h-[500px] overflow-y-auto custom-scroll">
        <FilterSection
          title={`Años (${yearFilters.length})`}
          icon={<IoCalendarNumberOutline />}
        >
          {yearFilters.map((filter) => (
            <FilterItem
              key={filter.id}
              filter={filter}
              icon={<IoCalendarNumberOutline />}
              color="bg-teal-500/10 border-teal-500/30 text-teal-300"
              onRemove={removeFilter}
            />
          ))}
        </FilterSection>

        <FilterSection
          title={`Autores (${personFilters.length})`}
          icon={<IoMdPerson />}
        >
          {personFilters.map((filter) => (
            <FilterItem
              key={filter.id}
              filter={filter}
              icon={<IoMdPerson />}
              color="bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
              onRemove={removeFilter}
            />
          ))}
        </FilterSection>

        <FilterSection
          title={`Categorías (${categoryFilters.length})`}
          icon={<IoPricetagOutline />}
        >
          {categoryFilters.map((filter) => (
            <FilterItem
              key={filter.id}
              filter={filter}
              icon={<IoPricetagOutline />}
              color="bg-amber-500/10 border-amber-500/30 text-amber-300"
              onRemove={removeFilter}
            />
          ))}
        </FilterSection>
      </div>

      {/* leyenda abajo */}
      <div className="mt-auto pt-4 border-t border-slate-800">
        <h3 className="text-xs text-slate-400 mb-3 uppercase tracking-wide">
          Referencias
        </h3>

        <div className="space-y-2 text-sm text-slate-300">

          <LegendItem color="bg-teal-500" label="Memorias" />
          <LegendItem color="bg-indigo-500" label="Personas" />
          <LegendItem color="bg-amber-500" label="Categorías" />

        </div>
      </div>

    </aside>
  );
}