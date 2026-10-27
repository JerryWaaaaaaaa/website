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
  cloneMesh,
  newMeshPreset,
  normalizeMeshParams,
  type MeshPreset,
} from './mesh';
import type { MeshGradientParams } from '../../sections/v6/mesh/meshRenderer';
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

const STORAGE_KEY = 'gradient-generator:v4';
// Older saves keep their palette / CSS presets / blob; their point-based
// meshes don't map onto the V6 mesh, so mesh presets restart from defaults.
const LEGACY_KEYS = ['gradient-generator:v3', 'gradient-generator:v2'];

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

function normalizeMeshPresets(value: unknown): MeshPreset[] {
  if (!Array.isArray(value)) return DEFAULT_MESH_PRESETS.map(cloneMesh);
  return value
    .filter((entry): entry is MeshPreset => !!entry && typeof entry === 'object' && 'params' in entry)
    .map((m) => ({
      id: String(m.id),
      name: String(m.name ?? 'Untitled mesh'),
      params: normalizeMeshParams(m.params),
    }));
}

// ---------------------------------------------------------------------------

function loadInitial(): StoredState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      if (parsed && parsed.palette && parsed.presets) {
        return {
          mode: normalizeMode(parsed.mode),
          palette: { ...DEFAULT_PALETTE, ...parsed.palette },
          presets: parsed.presets,
          meshPresets: normalizeMeshPresets(parsed.meshPresets),
          blob: normalizeBlob(parsed.blob),
        };
      }
    }

    for (const key of LEGACY_KEYS) {
      const legacy = window.localStorage.getItem(key);
      if (!legacy) continue;
      const parsed = JSON.parse(legacy) as Partial<StoredState>;
      return {
        mode: normalizeMode(parsed.mode),
        palette: { ...DEFAULT_PALETTE, ...(parsed.palette ?? {}) },
        presets: parsed.presets ?? DEFAULT_PRESETS.map(clonePreset),
        meshPresets: DEFAULT_MESH_PRESETS.map(cloneMesh),
        blob: normalizeBlob(parsed.blob),
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

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value));
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

  // Mesh presets (V6 WebGL mesh params)
  meshPresets: MeshPreset[];
  updateMesh: (id: string, updater: (preset: MeshPreset) => MeshPreset) => void;
  updateMeshParams: (
    id: string,
    update: Partial<MeshGradientParams> | ((params: MeshGradientParams) => MeshGradientParams),
  ) => void;
  addMesh: () => string;
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

  const updateMeshParams = useCallback(
    (
      id: string,
      update: Partial<MeshGradientParams> | ((params: MeshGradientParams) => MeshGradientParams),
    ) => {
      setState((prev) => ({
        ...prev,
        meshPresets: prev.meshPresets.map((p) =>
          p.id === id
            ? {
                ...p,
                params: typeof update === 'function' ? update(p.params) : { ...p.params, ...update },
              }
            : p,
        ),
      }));
    },
    [],
  );

  const addMesh = useCallback((): string => {
    const preset = newMeshPreset();
    setState((prev) => ({ ...prev, meshPresets: [...prev.meshPresets, preset] }));
    return preset.id;
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
    updateMeshParams,
    addMesh,
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
