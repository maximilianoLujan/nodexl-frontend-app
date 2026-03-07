import { useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { useGraphStore } from "../../store/graphStore";
import { MOUSE } from "three";
import { NODE_COLORS } from "../../constants/graphColors";
import type { GraphVertex } from "../../types/Graph.types";

export default function MemoryGraph() {
  const { graphData, loading, error, fetchGraph } = useGraphStore();
  const graphRef = useRef<any>(null);

  useEffect(() => {
    if (!graphRef.current) return;

    const controls = graphRef.current.controls();

    controls.mouseButtons = {
      LEFT: MOUSE.PAN,
      MIDDLE: null,
      RIGHT: MOUSE.ROTATE
    };

    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;
    controls.zoomSpeed = 0.4;

  }, [graphData]);

  useEffect(() => {
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
  if (!graphData) return null;

  return (
    <div 
      style={{ width: "100%", height: "600px" }}
      onMouseDown={(e) => {
        if (e.button === 0) { // click izquierdo
          e.currentTarget.style.cursor = "grabbing";
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.cursor = "grab";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.cursor = "grab";
      }}
      >
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        nodeColor={(node: GraphVertex) => NODE_COLORS[node.type]}
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