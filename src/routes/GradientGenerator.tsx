import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EditorDrawer } from './gradient-generator/EditorDrawer';
import { GradientCard } from './gradient-generator/GradientCard';
import { MeshCard } from './gradient-generator/MeshCard';
import { MeshEditorDrawer } from './gradient-generator/MeshEditorDrawer';
import { PalettePanel } from './gradient-generator/PalettePanel';
import { serializeAllAsCss, serializeAllAsJson } from './gradient-generator/buildCss';
import { useGradientStore } from './gradient-generator/useGradientStore';
import './gradient-generator.css';

export function GradientGenerator() {
  const store = useGradientStore();
  const { palette, presets, meshPresets, mode } = store;

  const [editingCssId, setEditingCssId] = useState<string | null>(null);
  const [editingMeshId, setEditingMeshId] = useState<string | null>(null);

  const editingCss = presets.find((p) => p.id === editingCssId) ?? null;
  const editingMesh = meshPresets.find((p) => p.id === editingMeshId) ?? null;

  const copyAllCss = () => {
    navigator.clipboard
      .writeText(serializeAllAsCss(palette, presets))
      .catch(() => {});
  };

  const copyAllJson = () => {
    const payload =
      mode === 'css'
        ? serializeAllAsJson(palette, presets)
        : JSON.stringify({ palette, meshPresets }, null, 2);
    navigator.clipboard.writeText(payload).catch(() => {});
  };

  const subtitle =
    mode === 'css'
      ? `${presets.length} mesh-style CSS gradients · click to edit · hover to copy`
      : `${meshPresets.length} true mesh gradients · click to edit · hover to download`;

  return (
    <div className="gg-shell">
      <header className="gg-topbar">
        <div className="gg-topbar-inner">
          <div className="gg-topbar-text">
            <h1 className="gg-title">Gradient Generator</h1>
            <p className="gg-subtitle">{subtitle}</p>
          </div>
          <Link to="/" className="gg-back-link">
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="gg-main">
        <PalettePanel
          palette={palette}
          onChange={store.setPaletteToken}
          onReset={store.reset}
          mode={mode}
          onModeChange={(nextMode) => {
            store.setMode(nextMode);
            setEditingCssId(null);
            setEditingMeshId(null);
          }}
          onCopyAllCss={copyAllCss}
          onCopyAllJson={copyAllJson}
        />

        {mode === 'css' ? (
          <div className="gg-grid">
            {presets.map((preset) => (
              <GradientCard
                key={preset.id}
                preset={preset}
                palette={palette}
                onEdit={() => setEditingCssId(preset.id)}
              />
            ))}
          </div>
        ) : (
          <div className="gg-grid">
            {meshPresets.map((preset) => (
              <MeshCard
                key={preset.id}
                preset={preset}
                palette={palette}
                onEdit={() => setEditingMeshId(preset.id)}
              />
            ))}
          </div>
        )}
      </main>

      {mode === 'css' && editingCss && (
        <EditorDrawer
          preset={editingCss}
          palette={palette}
          store={store}
          onClose={() => setEditingCssId(null)}
          onDuplicated={(newId) => setEditingCssId(newId)}
        />
      )}

      {mode === 'mesh' && editingMesh && (
        <MeshEditorDrawer
          preset={editingMesh}
          palette={palette}
          store={store}
          onClose={() => setEditingMeshId(null)}
          onDuplicated={(newId) => setEditingMeshId(newId)}
        />
      )}
    </div>
  );
}
