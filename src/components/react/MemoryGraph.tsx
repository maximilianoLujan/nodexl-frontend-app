import { useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { useGraphStore } from "../../store/graphStore";

export default function MemoryGraph() {
  const { graphData, loading, error, fetchGraph } = useGraphStore();

  useEffect(() => {
    // Solo cargamos si no hay datos ya presentes para evitar refetch innecesarios
    if (!graphData) {
      fetchGraph();
    }
  }, [fetchGraph, graphData]);

  if (loading) return (
    <div className="flex items-center justify-center h-150 text-slate-400">
      <p>Cargando grafo...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-150 text-red-400">
      <p>{error}</p>
    </div>
  );
  
  if (!graphData) return null;

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ForceGraph3D
        graphData={graphData}
        nodeAutoColorBy="group"
        nodeLabel={(node: any) =>
          node.type === "publication"
            ? `📄 Publicación: ${node.label}`
            : node.type === "person"
              ? `🧍 Persona: ${node.label}`
              : `🗂 Categoría: ${node.label}`
        }
      />
    </div>
  );
}