import { useEffect, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import getGraph from "../../services/graphService";

const mapGraphData = (apiData: any) => {
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


export default function MemoryGraph() {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGraph = async () => {
      try {
        const data = await getGraph();
        setGraphData(mapGraphData(data));
      } catch {
        setError("No se pudo cargar el grafo");
      } finally {
        setLoading(false);
      }
    };

    loadGraph();
  }, []);

  if (loading) return <p>Cargando grafo...</p>;
  if (error) return <p>{error}</p>;
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