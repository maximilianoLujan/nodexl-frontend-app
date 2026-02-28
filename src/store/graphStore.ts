import { create } from 'zustand';
import getGraph from '../services/graphService';
import type { GraphApiResponse } from '../types/Graph.types';

interface GraphState {
  graphData: any;
  loading: boolean;
  error: string | null;
  fetchGraph: () => Promise<void>;
}

const mapGraphData = (apiData: GraphApiResponse) => {
  return {
    nodes: apiData.vertices.map((v: any) => ({
      id: v.id,
      label: v.label,
      type: v.type,
      group:
        v.type === "person"
          ? 1
          : v.type === "publication"
            ? 2
            : 3,
    })),
    links: apiData.edges.map((e: any) => ({
      source: e.source,
      target: e.target,
    })),
  };
};

export const useGraphStore = create<GraphState>((set) => ({
  graphData: null,
  loading: false,
  error: null,
  fetchGraph: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getGraph();
      set({ graphData: mapGraphData(data), loading: false });
    } catch (err) {
      set({ error: "No se pudo cargar el grafo", loading: false });
      console.error(err);
    }
  },
}));
