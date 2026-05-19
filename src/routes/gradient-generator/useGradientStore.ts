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
  MESH_MAX,
  MESH_MIN,
  resizeCells,
  type MeshPreset,
} from './mesh';
import type { TokenId } from './tokens';

const STORAGE_KEY = 'gradient-generator:v2';

export type GeneratorMode = 'css' | 'mesh';

type StoredState = {
  mode: GeneratorMode;
  palette: Palette;
  presets: GradientPreset[];
  meshPresets: MeshPreset[];
};

function defaultState(): StoredState {
  return {
    mode: 'css',
    palette: DEFAULT_PALETTE,
    presets: DEFAULT_PRESETS.map(clonePreset),
    meshPresets: DEFAULT_MESH_PRESETS.map(cloneMesh),
  };
}

function loadInitial(): StoredState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (!parsed.palette || !parsed.presets) return defaultState();
    return {
      mode: parsed.mode === 'mesh' ? 'mesh' : 'css',
      palette: { ...DEFAULT_PALETTE, ...parsed.palette },
      presets: parsed.presets,
      meshPresets: parsed.meshPresets ?? DEFAULT_MESH_PRESETS.map(cloneMesh),
    };
  } catch {
    return defaultState();
  }
}

function clonePreset(preset: GradientPreset): GradientPreset {
  return {
    ...preset,
    layers: preset.layers.map((layer) => ({ ...layer })),
  };
}

function cloneMesh(preset: MeshPreset): MeshPreset {
  return { ...preset, cells: [...preset.cells] };
}

function clampMesh(value: number): number {
  return Math.max(MESH_MIN, Math.min(MESH_MAX, Math.round(value)));
}

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

  // Mesh presets
  meshPresets: MeshPreset[];
  updateMesh: (id: string, updater: (preset: MeshPreset) => MeshPreset) => void;
  setMeshCell: (id: string, cellIndex: number, value: PaletteKey) => void;
  resizeMesh: (id: string, rows: number, cols: number) => void;
  duplicateMesh: (id: string) => string;
  deleteMesh: (id: string) => void;

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

  const updateMesh = useCallback(
    (id: string, updater: (preset: MeshPreset) => MeshPreset) => {
      setState((prev) => ({
        ...prev,
        meshPresets: prev.meshPresets.map((p) => (p.id === id ? updater(p) : p)),
      }));
    },
    [],
  );

  const setMeshCell = useCallback(
    (id: string, cellIndex: number, value: PaletteKey) => {
      setState((prev) => ({
        ...prev,
        meshPresets: prev.meshPresets.map((preset) => {
          if (preset.id !== id) return preset;
          if (cellIndex < 0 || cellIndex >= preset.cells.length) return preset;
          const cells = preset.cells.slice();
          cells[cellIndex] = value;
          return { ...preset, cells };
        }),
      }));
    },
    [],
  );

  const resizeMesh = useCallback((id: string, rows: number, cols: number) => {
    const nextRows = clampMesh(rows);
    const nextCols = clampMesh(cols);
    setState((prev) => ({
      ...prev,
      meshPresets: prev.meshPresets.map((preset) => {
        if (preset.id !== id) return preset;
        if (preset.rows === nextRows && preset.cols === nextCols) return preset;
        return {
          ...preset,
          rows: nextRows,
          cols: nextCols,
          cells: resizeCells(
            preset.cells,
            preset.rows,
            preset.cols,
            nextRows,
            nextCols,
            'c1',
          ),
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
    setMeshCell,
    resizeMesh,
    duplicateMesh,
    deleteMesh,
    reset,
  };
}
