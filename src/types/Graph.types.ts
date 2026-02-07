export type GraphApiResponse = {
  summary: GraphSummary;
  vertices: GraphVertex[];
  edges: GraphEdge[];
};

export type GraphSummary = {
  vertex_count: number;
  edge_count: number;
};

export type BaseVertex = {
  id: string;
  type: string;
  label: string;
};

export type PublicationVertex = BaseVertex & {
  type: "publication";
  year: number;
  category: string;
  source_item_id: number;
  source_proceso_id: number;
  publication_type: string;
};

export type CategoryVertex = BaseVertex & {
  type: "category";
};

export type PersonVertex = BaseVertex & {
  type: "person";
};

export type GraphVertex =
  | PublicationVertex
  | CategoryVertex
  | PersonVertex;

export type GraphEdge = {
  source: string;
  target: string;
  type: "has_category" | "authored" | string;
};
