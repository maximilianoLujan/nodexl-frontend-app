import { create } from 'zustand';
import { getGraph, getGraphProcess } from '../services/graphService';
import type { GraphApiResponse } from '../types/Graph.types';

interface GraphState {
  graphData: any;
  loading: boolean;
  error: string | null;
  fetchGraph: () => Promise<void>;
  fetchGraphByMemory: (memoryId: number) => Promise<void>;
  clearGraph: () => void;
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

export const useGraphStore = create<GraphState>((set,get) => ({
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
  fetchGraphByMemory: async (memoryId: number) => {
    set({ loading: true, error: null });

    try {
      const data = await getGraphProcess(memoryId);
      const newGraph = mapGraphData(data);

      const currentGraph = get().graphData;

      if (!currentGraph) {
        set({ graphData: newGraph, loading: false });
        return;
      }

      const mergedNodes = [
        ...currentGraph.nodes,
        ...newGraph.nodes.filter(
          (n) => !currentGraph.nodes.some((c: any) => c.id === n.id)
        ),
      ];

      const mergedLinks = [
        ...currentGraph.links,
        ...newGraph.links.filter(
          (l) =>
            !currentGraph.links.some(
              (c: any) => c.source === l.source && c.target === l.target
            ),
        ),
      ];

      set({
        graphData: {
          nodes: mergedNodes,
          links: mergedLinks,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: "No se pudo cargar el grafo parcial", loading: false });
      console.error(err);
    }
  },

  clearGraph: () => {
    set({ graphData: { nodes: [], links: [] } });
  },
}));
