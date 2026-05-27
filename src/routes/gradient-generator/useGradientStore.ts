import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PALETTE,
  DEFAULT_PRESETS,
  type GradientPreset,
  type Layer,
  type Palette,
  type PaletteKey,
} from './presets';
import {
  DEFAULT_MESH_PRESETS,
  POINTS_MAX,
  POINTS_MIN,
  SOFTNESS_MAX,
  SOFTNESS_MIN,
  type MeshPoint,
  type MeshPreset,
} from './mesh';
import {
  BLOB_MAX,
  BLOB_MIN,
  BLOB_STARTERS,
  cloneBlob,
  defaultBlob,
  type BlobPreset,
  type BlobShape,
} from './blob';
import type { TokenId } from './tokens';

const STORAGE_KEY = 'gradient-generator:v3';
const LEGACY_KEY_V2 = 'gradient-generator:v2';

export type GeneratorMode = 'css' | 'mesh' | 'blob';

type StoredState = {
  mode: GeneratorMode;
  palette: Palette;
  presets: GradientPreset[];
  meshPresets: MeshPreset[];
  blob: BlobPreset;
};

function defaultState(): StoredState {
  return {
    mode: 'css',
    palette: DEFAULT_PALETTE,
    presets: DEFAULT_PRESETS.map(clonePreset),
    meshPresets: DEFAULT_MESH_PRESETS.map(cloneMesh),
    blob: defaultBlob(),
  };
}

// --- Legacy v2 grid-mesh shape (for migration only) -------------------------

type LegacyMeshPreset = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: PaletteKey[];
};

function looksLikeLegacyMesh(value: unknown): value is LegacyMeshPreset {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.rows === 'number' &&
    typeof v.cols === 'number' &&
    Array.isArray(v.cells)
  );
}

const LEGACY_V2_MESH_IDS = new Set([
  'aurora-mesh',
  'dusk-mesh',
  'bloom-mesh',
  'horizon-mesh',
  'prism-mesh',
  'iris-mesh',
]);

/**
 * Returns true when the mesh list is the unmodified v2 default set:
 * exactly the legacy ids with no additions, copies, or new presets.
 * Used to silently upgrade users to the new 22 defaults without
 * clobbering anyone who customized their list.
 */
function isStaleLegacyMeshSet(presets: MeshPreset[]): boolean {
  if (presets.length === 0) return true;
  if (presets.length > LEGACY_V2_MESH_IDS.size) return false;
  return presets.every((p) => LEGACY_V2_MESH_IDS.has(p.id));
}

/**
 * Convert a v2 grid-based mesh preset into a v3 point-based mesh preset.
 * For grids that fit within POINTS_MAX we sample every cell centroid; for
 * larger grids we sample 4 corners + center to stay within bounds.
 */
function migrateLegacyMesh(legacy: LegacyMeshPreset): MeshPreset {
  const { rows, cols, cells } = legacy;
  const cellCount = rows * cols;
  const points: MeshPoint[] = [];

  if (cellCount <= POINTS_MAX) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const key = cells[idx];
        if (!key) continue;
        points.push({
          x: ((col + 0.5) / cols) * 100,
          y: ((row + 0.5) / rows) * 100,
          paletteKey: key,
          weight: 1,
        });
      }
    }
  } else {
    const positions: Array<[number, number]> = [
      [0, 0],
      [0, cols - 1],
      [rows - 1, 0],
      [rows - 1, cols - 1],
      [Math.floor(rows / 2), Math.floor(cols / 2)],
    ];
    for (const [row, col] of positions) {
      const idx = row * cols + col;
      const key = cells[idx];
      if (!key) continue;
      points.push({
        x: ((col + 0.5) / cols) * 100,
        y: ((row + 0.5) / rows) * 100,
        paletteKey: key,
        weight: 1,
      });
    }
  }

  if (points.length < POINTS_MIN) {
    points.push({ x: 25, y: 25, paletteKey: 'c1', weight: 1 });
    points.push({ x: 75, y: 75, paletteKey: 'c4', weight: 1 });
  }

  return {
    id: legacy.id,
    name: legacy.name,
    softness: 0.4,
    points,
  };
}

function migrateMeshPresets(value: unknown): MeshPreset[] {
  if (!Array.isArray(value)) return DEFAULT_MESH_PRESETS.map(cloneMesh);
  return value.map((entry) => {
    if (looksLikeLegacyMesh(entry)) return migrateLegacyMesh(entry);
    if (
      entry &&
      typeof entry === 'object' &&
      Array.isArray((entry as MeshPreset).points)
    ) {
      const m = entry as MeshPreset;
      return {
        id: String(m.id),
        name: String(m.name ?? 'Untitled'),
        softness: clampSoftness(Number(m.softness ?? 0.4)),
        points: m.points
          .map((point) => ({
            x: Math.max(0, Math.min(100, Number(point.x))),
            y: Math.max(0, Math.min(100, Number(point.y))),
            paletteKey: point.paletteKey,
            weight: Math.max(0, Math.min(1, Number(point.weight ?? 1))),
          }))
          .slice(0, POINTS_MAX),
      };
    }
    return cloneMesh(DEFAULT_MESH_PRESETS[0]);
  });
}

// ---------------------------------------------------------------------------

function loadInitial(): StoredState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const rawV3 = window.localStorage.getItem(STORAGE_KEY);
    if (rawV3) {
      const parsed = JSON.parse(rawV3) as Partial<StoredState>;
      if (parsed && parsed.palette && parsed.presets) {
        const migrated = migrateMeshPresets(parsed.meshPresets);
        const meshPresets = isStaleLegacyMeshSet(migrated)
          ? DEFAULT_MESH_PRESETS.map(cloneMesh)
          : migrated;
        return {
          mode: normalizeMode(parsed.mode),
          palette: { ...DEFAULT_PALETTE, ...parsed.palette },
          presets: parsed.presets,
          meshPresets,
          blob: normalizeBlob(parsed.blob),
        };
      }
    }

    const rawV2 = window.localStorage.getItem(LEGACY_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Partial<StoredState> & {
        meshPresets?: unknown;
      };
      const migrated = migrateMeshPresets(parsed.meshPresets);
      const meshPresets = isStaleLegacyMeshSet(migrated)
        ? DEFAULT_MESH_PRESETS.map(cloneMesh)
        : migrated;
      return {
        mode: normalizeMode(parsed.mode),
        palette: { ...DEFAULT_PALETTE, ...(parsed.palette ?? {}) },
        presets: parsed.presets ?? DEFAULT_PRESETS.map(clonePreset),
        meshPresets,
        blob: defaultBlob(),
      };
    }

    return defaultState();
  } catch {
    return defaultState();
  }
}

function normalizeMode(mode: unknown): GeneratorMode {
  if (mode === 'mesh' || mode === 'blob' || mode === 'css') return mode;
  return 'css';
}

function normalizeBlob(value: unknown): BlobPreset {
  if (!value || typeof value !== 'object') return defaultBlob();
  const v = value as Partial<BlobPreset>;
  if (!Array.isArray(v.shapes)) return defaultBlob();
  const shapes = v.shapes
    .map((shape) => ({
      x: Math.max(-20, Math.min(120, Number(shape.x))),
      y: Math.max(-20, Math.min(120, Number(shape.y))),
      sizePct: Math.max(4, Math.min(200, Number(shape.sizePct ?? 30))),
      blurPct: Math.max(0, Math.min(100, Number(shape.blurPct ?? 50))),
      paletteKey: (shape.paletteKey as PaletteKey) ?? 'c3',
      alpha: Math.max(0, Math.min(1, Number(shape.alpha ?? 0.85))),
    }))
    .slice(0, BLOB_MAX);
  return {
    id: String(v.id ?? 'workspace'),
    name: String(v.name ?? 'Untitled'),
    shapes: shapes.length ? shapes : defaultBlob().shapes,
  };
}

function clonePreset(preset: GradientPreset): GradientPreset {
  return {
    ...preset,
    layers: preset.layers.map((layer) => ({ ...layer })),
  };
}

function cloneMesh(preset: MeshPreset): MeshPreset {
  return {
    ...preset,
    points: preset.points.map((point) => ({ ...point })),
  };
}

function clampSoftness(value: number): number {
  if (Number.isNaN(value)) return 0.4;
  return Math.max(SOFTNESS_MIN, Math.min(SOFTNESS_MAX, value));
}

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function clampWeight(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// ---------------------------------------------------------------------------

export type GradientStore = {
  mode: GeneratorMode;
  setMode: (mode: GeneratorMode) => void;

  palette: Palette;
  setPaletteToken: (key: PaletteKey, token: TokenId) => void;

  // CSS presets
  presets: GradientPreset[];
  updatePreset: (id: string, updater: (preset: GradientPreset) => GradientPreset) => void;
  updateLayer: (presetId: string, layerIndex: number, updater: (layer: Layer) => Layer) => void;
  addLayer: (presetId: string) => void;
  removeLayer: (presetId: string, layerIndex: number) => void;
  duplicatePreset: (id: string) => string;
  deletePreset: (id: string) => void;

  // Mesh presets (point-based, v3)
  meshPresets: MeshPreset[];
  updateMesh: (id: string, updater: (preset: MeshPreset) => MeshPreset) => void;
  movePoint: (presetId: string, pointIndex: number, x: number, y: number) => void;
  setPointPaletteKey: (presetId: string, pointIndex: number, key: PaletteKey) => void;
  setPointWeight: (presetId: string, pointIndex: number, weight: number) => void;
  setMeshSoftness: (presetId: string, softness: number) => void;
  addPoint: (presetId: string) => void;
  removePoint: (presetId: string, pointIndex: number) => void;
  duplicateMesh: (id: string) => string;
  deleteMesh: (id: string) => void;

  // Blob workspace
  blob: BlobPreset;
  setBlobName: (name: string) => void;
  loadBlobStarter: (starterId: string) => void;
  addBlobShape: () => void;
  removeBlobShape: (index: number) => void;
  moveBlobShape: (index: number, x: number, y: number) => void;
  updateBlobShape: (index: number, partial: Partial<BlobShape>) => void;
  resetBlob: () => void;

  reset: () => void;
};

export function useGradientStore(): GradientStore {
  const [state, setState] = useState<StoredState>(loadInitial);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const setMode = useCallback((mode: GeneratorMode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const setPaletteToken = useCallback((key: PaletteKey, token: TokenId) => {
    setState((prev) => ({ ...prev, palette: { ...prev.palette, [key]: token } }));
  }, []);

  // --- CSS preset actions ---------------------------------------------------

  const updatePreset = useCallback(
    (id: string, updater: (preset: GradientPreset) => GradientPreset) => {
      setState((prev) => ({
        ...prev,
        presets: prev.presets.map((p) => (p.id === id ? updater(p) : p)),
      }));
    },
    [],
  );

  const updateLayer = useCallback(
    (presetId: string, layerIndex: number, updater: (layer: Layer) => Layer) => {
      setState((prev) => ({
        ...prev,
        presets: prev.presets.map((preset) => {
          if (preset.id !== presetId) return preset;
          return {
            ...preset,
            layers: preset.layers.map((layer, idx) =>
              idx === layerIndex ? updater(layer) : layer,
            ),
          };
        }),
      }));
    },
    [],
  );

  const addLayer = useCallback((presetId: string) => {
    setState((prev) => ({
      ...prev,
      presets: prev.presets.map((preset) => {
        if (preset.id !== presetId) return preset;
        const newLayer: Layer = {
          shape: 'ellipse',
          xPct: 50,
          yPct: 50,
          sizePct: 50,
          paletteKey: 'c3',
          alpha: 200,
        };
        return { ...preset, layers: [...preset.layers, newLayer] };
      }),
    }));
  }, []);

  const removeLayer = useCallback((presetId: string, layerIndex: number) => {
    setState((prev) => ({
      ...prev,
      presets: prev.presets.map((preset) => {
        if (preset.id !== presetId) return preset;
        return {
          ...preset,
          layers: preset.layers.filter((_, idx) => idx !== layerIndex),
        };
      }),
    }));
  }, []);

  const duplicatePreset = useCallback((id: string): string => {
    const newId = `${id}-copy-${Date.now().toString(36)}`;
    setState((prev) => {
      const sourceIndex = prev.presets.findIndex((p) => p.id === id);
      if (sourceIndex === -1) return prev;
      const source = prev.presets[sourceIndex];
      const copy: GradientPreset = {
        ...clonePreset(source),
        id: newId,
        name: `${source.name} copy`,
      };
      const next = [...prev.presets];
      next.splice(sourceIndex + 1, 0, copy);
      return { ...prev, presets: next };
    });
    return newId;
  }, []);

  const deletePreset = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      presets: prev.presets.filter((p) => p.id !== id),
    }));
  }, []);

  // --- Mesh preset actions --------------------------------------------------

  const updateMesh = useCallback(
    (id: string, updater: (preset: MeshPreset) => MeshPreset) => {
      setState((prev) => ({
        ...prev,
        meshPresets: prev.meshPresets.map((p) => (p.id === id ? updater(p) : p)),
      }));
    },
    [],
  );

  const movePoint = useCallback(
    (presetId: string, pointIndex: number, x: number, y: number) => {
      setState((prev) => ({
        ...prev,
        meshPresets: prev.meshPresets.map((preset) => {
          if (preset.id !== presetId) return preset;
          if (pointIndex < 0 || pointIndex >= preset.points.length) return preset;
          const points = preset.points.slice();
          points[pointIndex] = {
            ...points[pointIndex],
            x: clampPct(x),
            y: clampPct(y),
          };
          return { ...preset, points };
        }),
      }));
    },
    [],
  );

  const setPointPaletteKey = useCallback(
    (presetId: string, pointIndex: number, key: PaletteKey) => {
      setState((prev) => ({
        ...prev,
        meshPresets: prev.meshPresets.map((preset) => {
          if (preset.id !== presetId) return preset;
          if (pointIndex < 0 || pointIndex >= preset.points.length) return preset;
          const points = preset.points.slice();
          points[pointIndex] = { ...points[pointIndex], paletteKey: key };
          return { ...preset, points };
        }),
      }));
    },
    [],
  );

  const setPointWeight = useCallback(
    (presetId: string, pointIndex: number, weight: number) => {
      setState((prev) => ({
        ...prev,
        meshPresets: prev.meshPresets.map((preset) => {
          if (preset.id !== presetId) return preset;
          if (pointIndex < 0 || pointIndex >= preset.points.length) return preset;
          const points = preset.points.slice();
          points[pointIndex] = {
            ...points[pointIndex],
            weight: clampWeight(weight),
          };
          return { ...preset, points };
        }),
      }));
    },
    [],
  );

  const setMeshSoftness = useCallback(
    (presetId: string, softness: number) => {
      setState((prev) => ({
        ...prev,
        meshPresets: prev.meshPresets.map((preset) => {
          if (preset.id !== presetId) return preset;
          return { ...preset, softness: clampSoftness(softness) };
        }),
      }));
    },
    [],
  );

  const addPoint = useCallback((presetId: string) => {
    setState((prev) => ({
      ...prev,
      meshPresets: prev.meshPresets.map((preset) => {
        if (preset.id !== presetId) return preset;
        if (preset.points.length >= POINTS_MAX) return preset;
        const newPoint: MeshPoint = {
          x: 50,
          y: 50,
          paletteKey: 'c3',
          weight: 1,
        };
        return { ...preset, points: [...preset.points, newPoint] };
      }),
    }));
  }, []);

  const removePoint = useCallback((presetId: string, pointIndex: number) => {
    setState((prev) => ({
      ...prev,
      meshPresets: prev.meshPresets.map((preset) => {
        if (preset.id !== presetId) return preset;
        if (preset.points.length <= POINTS_MIN) return preset;
        return {
          ...preset,
          points: preset.points.filter((_, idx) => idx !== pointIndex),
        };
      }),
    }));
  }, []);

  const duplicateMesh = useCallback((id: string): string => {
    const newId = `${id}-copy-${Date.now().toString(36)}`;
    setState((prev) => {
      const sourceIndex = prev.meshPresets.findIndex((p) => p.id === id);
      if (sourceIndex === -1) return prev;
      const source = prev.meshPresets[sourceIndex];
      const copy: MeshPreset = {
        ...cloneMesh(source),
        id: newId,
        name: `${source.name} copy`,
      };
      const next = [...prev.meshPresets];
      next.splice(sourceIndex + 1, 0, copy);
      return { ...prev, meshPresets: next };
    });
    return newId;
  }, []);

  const deleteMesh = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      meshPresets: prev.meshPresets.filter((p) => p.id !== id),
    }));
  }, []);

  // --- Blob workspace actions ----------------------------------------------

  const setBlobName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, blob: { ...prev.blob, name } }));
  }, []);

  const loadBlobStarter = useCallback((starterId: string) => {
    const starter = BLOB_STARTERS.find((s) => s.id === starterId);
    if (!starter) return;
    setState((prev) => ({
      ...prev,
      blob: {
        id: prev.blob.id,
        name: starter.name,
        shapes: starter.shapes.map((shape) => ({ ...shape })),
      },
    }));
  }, []);

  const addBlobShape = useCallback(() => {
    setState((prev) => {
      if (prev.blob.shapes.length >= BLOB_MAX) return prev;
      const newShape: BlobShape = {
        x: 50,
        y: 50,
        sizePct: 30,
        blurPct: 55,
        paletteKey: 'c3',
        alpha: 0.85,
      };
      return {
        ...prev,
        blob: { ...prev.blob, shapes: [...prev.blob.shapes, newShape] },
      };
    });
  }, []);

  const removeBlobShape = useCallback((index: number) => {
    setState((prev) => {
      if (prev.blob.shapes.length <= BLOB_MIN) return prev;
      return {
        ...prev,
        blob: {
          ...prev.blob,
          shapes: prev.blob.shapes.filter((_, i) => i !== index),
        },
      };
    });
  }, []);

  const moveBlobShape = useCallback((index: number, x: number, y: number) => {
    setState((prev) => {
      if (index < 0 || index >= prev.blob.shapes.length) return prev;
      const shapes = prev.blob.shapes.slice();
      shapes[index] = { ...shapes[index], x: clampPct(x), y: clampPct(y) };
      return { ...prev, blob: { ...prev.blob, shapes } };
    });
  }, []);

  const updateBlobShape = useCallback(
    (index: number, partial: Partial<BlobShape>) => {
      setState((prev) => {
        if (index < 0 || index >= prev.blob.shapes.length) return prev;
        const shapes = prev.blob.shapes.slice();
        shapes[index] = { ...shapes[index], ...partial };
        return { ...prev, blob: { ...prev.blob, shapes } };
      });
    },
    [],
  );

  const resetBlob = useCallback(() => {
    setState((prev) => ({ ...prev, blob: cloneBlob(BLOB_STARTERS[0]) }));
  }, []);

  const reset = useCallback(() => {
    setState(defaultState());
  }, []);

  return {
    mode: state.mode,
    setMode,
    palette: state.palette,
    setPaletteToken,
    presets: state.presets,
    updatePreset,
    updateLayer,
    addLayer,
    removeLayer,
    duplicatePreset,
    deletePreset,
    meshPresets: state.meshPresets,
    updateMesh,
    movePoint,
    setPointPaletteKey,
    setPointWeight,
    setMeshSoftness,
    addPoint,
    removePoint,
    duplicateMesh,
    deleteMesh,
    blob: state.blob,
    setBlobName,
    loadBlobStarter,
    addBlobShape,
    removeBlobShape,
    moveBlobShape,
    updateBlobShape,
    resetBlob,
    reset,
  };
}
