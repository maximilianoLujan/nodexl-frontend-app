import { create } from "zustand";
import { persist } from "zustand/middleware";

type FilterType = "year" | "person" | "category";

interface Filter {
  type: FilterType;
  id: number | string;
  value: string | number;
  label: string;
}

interface FilterState {
  filters: Filter[];
  addFilter: (filter: Filter) => void;
  removeFilter: (filter: Filter) => void;
  clearFilters: () => void;
  buildQuery: () => string;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      filters: [],

      addFilter: (filter) =>
        set((state) => ({
          filters: [...state.filters, filter],
        })),

      removeFilter: (filter) =>
        set((state) => ({
          filters: state.filters.filter(
            (f) => !(f.id === filter.id && f.type === filter.type)
          ),
        })),

      clearFilters: () => set({ filters: [] }),

      buildQuery: () => {
        const filters = get().filters;

        const params = new URLSearchParams();

        filters.forEach((f) => {
          if (f.type === "year") params.append("anio", String(f.value));
          if (f.type === "person") params.append("persona", String(f.value));
          if (f.type === "category") params.append("categoria", String(f.value));
        });

        const query = params.toString();

        return query ? `?${query}` : "";
      },
    }),
    {
      name: "memory-filters", // key en localStorage
    }
  )
);