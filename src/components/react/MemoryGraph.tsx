import { useState, useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { useGraphStore } from "../../store/graphStore";
import { MOUSE } from "three";
import { NODE_COLORS } from "../../constants/graphColors";
import * as THREE from "three";
import type { GraphVertex } from "../../types/Graph.types";
import { useFilterStore } from "../../store/filterStore";

const normalize = (str: string) => str.toLowerCase().replace(/,/g, "").trim();

export default function MemoryGraph() {
  const [size, setSize] = useState({
    width: window.innerWidth - 340,
    height: window.innerHeight - 65,
  });
  const { graphData, metrics, loading, error, fetchGraph } = useGraphStore();
  const { filters } = useFilterStore();
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const exportMetricsToCSV = async () => {
    if (!metrics || !graphData) return;

    const rows = [
      ["Métrica", "Cantidad"],
      ["Autores", metrics.authors_count],
      ["Artículos", metrics.articles_count],
      ["Categorías", metrics.category_count],
      ["Nodos", graphData.nodes.length],
      ["Links", graphData.links.length],
    ];

    const csvContent = "\uFEFF" + rows.map((r) => r.join(";")).join("\n");
    const fileName = `metricas_grafo_${new Date().toISOString().slice(0, 10)}.csv`;

    // Intentar primero el diálogo nativo de Tauri.
    // Nota: en Tauri v2 puede no existir `window.__TAURI__`, así que evitamos depender de eso.
    try {
      const [{ save }, { writeTextFile }] = await Promise.all([
        import("@tauri-apps/plugin-dialog"),
        import("@tauri-apps/plugin-fs"),
      ]);

      const selectedPath = await save({
        defaultPath: fileName,
        filters: [{ name: "CSV", extensions: ["csv"] }],
      });

      if (!selectedPath) return; // user cancelled

      const finalPath = selectedPath.toLowerCase().endsWith(".csv")
        ? selectedPath
        : `${selectedPath}.csv`;

      await writeTextFile(finalPath, csvContent);

      console.log("CSV guardado (Tauri) ✅", finalPath);
      return;
    } catch (err) {
      console.warn(
        "No se pudo abrir el diálogo de guardado de Tauri; fallback a web.",
        err,
      );
    }

    // 🌐 navegador (fallback)
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    console.log("CSV descargado (web) ✅");
  };

  const personNameFilters = filters
    .filter((p) => p.type === "person")
    .map((person) => person.value);

  useEffect(() => {
    if (!graphRef.current) return;

    const controls = graphRef.current.controls();

    controls.mouseButtons = {
      LEFT: MOUSE.PAN,
      MIDDLE: null,
      RIGHT: MOUSE.ROTATE,
    };

    controls.panSpeed = 0.1;
    controls.rotateSpeed = 0.1;
    controls.zoomSpeed = 0.4;
  }, [graphData]);

  const isHighlighted = (node: GraphVertex) => {
    if (node.type !== "person") return false;

    const nodeTokens = normalize(node.label).split(" ");

    return personNameFilters.some((name) => {
      if (typeof name !== "string") return false;

      const filterTokens = normalize(name).split(" ");
      return nodeTokens.every((token) => filterTokens.includes(token));
    });
  };

  useEffect(() => {
    if (!graphData) {
      fetchGraph();
    }
  }, [fetchGraph, graphData]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-150 text-slate-400">
        <p>Cargando grafo...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-150 text-red-400">
        <p>{error}</p>
      </div>
    );

  if (!graphData) return null;
  if (!graphData) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseDown={(e) => {
        if (e.button === 0) {
          // click izquierdo
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
      <div className="absolute inset-0">
        <ForceGraph3D
          width={size.width}
          height={size.height}
          ref={graphRef}
          graphData={graphData}
          nodeThreeObject={(node: GraphVertex) => {
            const group = new THREE.Group();

            const baseColor = NODE_COLORS[node.type];
            const size = isHighlighted(node) ? 6 : 4;

            // 👉 BORDE primero
            if (isHighlighted(node)) {
              const border = new THREE.Mesh(
                new THREE.SphereGeometry(size * 1.25),
                new THREE.MeshBasicMaterial({
                  color: "#ffffff",
                  transparent: true,
                  opacity: 0.25, // 🔥 clave: bajá esto
                  depthWrite: false, // evita que tape
                }),
              );

              group.add(border);
            }

            // 👉 esfera principal después
            const main = new THREE.Mesh(
              new THREE.SphereGeometry(size),
              new THREE.MeshStandardMaterial({
                color: baseColor,
              }),
            );

            group.add(main);

            return group;
          }}
          nodeLabel={(node: any) =>
            node.type === "publication"
              ? `📄 Publicación: ${node.label}`
              : node.type === "person"
                ? `🧍 Persona: ${node.label}`
                : `🗂 Categoría: ${node.label}`
          }
        />
      </div>
      <div
        className="absolute bottom-6 right-6 z-[999] pointer-events-auto
      bg-gradient-to-br from-slate-900/90 to-slate-800/80
      backdrop-blur-md text-slate-100
      p-5 rounded-2xl border border-slate-700/50
      shadow-2xl w-[260px] sm:w-[300px]"
      >
        <p className="text-sm font-semibold mb-3 text-slate-300 tracking-wide">
          📊 Métricas
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Autores</span>
            <span className="font-medium">{metrics.authors_count}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Artículos</span>
            <span className="font-medium">{metrics.articles_count}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Categorías</span>
            <span className="font-medium">{metrics.category_count}</span>
          </div>

          <div className="border-t border-slate-700/50 my-2" />

          <div className="flex justify-between">
            <span className="text-slate-400">Nodos</span>
            <span className="font-medium">{graphData.nodes.length}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Links</span>
            <span className="font-medium">{graphData.links.length}</span>
          </div>
        </div>
        <button
          onClick={exportMetricsToCSV}
          className="mt-4 w-full flex items-center justify-center gap-2
          bg-gradient-to-r from-blue-500 to-indigo-500
          hover:from-blue-600 hover:to-indigo-600
          text-white text-sm font-medium
          py-2 px-4 rounded-xl
          transition-all duration-200
          shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
        >
          ⬇ Exportar CSV
        </button>
      </div>
    </div>
  );
}
