import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlobEditor } from './gradient-generator/BlobEditor';
import { EditorDrawer } from './gradient-generator/EditorDrawer';
import { GradientCard } from './gradient-generator/GradientCard';
import { MeshCard } from './gradient-generator/MeshCard';
import { MeshEditorDrawer } from './gradient-generator/MeshEditorDrawer';
import { PalettePanel } from './gradient-generator/PalettePanel';
import { serializeAllAsCss, serializeAllAsJson } from './gradient-generator/buildCss';
import { blobToSvgString } from './gradient-generator/blobExport';
import { useGradientStore } from './gradient-generator/useGradientStore';
import './gradient-generator.css';

export function GradientGenerator() {
  const store = useGradientStore();
  const { palette, presets, meshPresets, blob, mode } = store;

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
    let payload: string;
    if (mode === 'css') {
      payload = serializeAllAsJson(palette, presets);
    } else if (mode === 'mesh') {
      payload = JSON.stringify({ palette, meshPresets }, null, 2);
    } else {
      payload = JSON.stringify({ palette, blob }, null, 2);
    }
    navigator.clipboard.writeText(payload).catch(() => {});
  };

  const copyBlobSvg = () => {
    const svg = blobToSvgString(blob, palette);
    navigator.clipboard.writeText(svg).catch(() => {});
  };

  let subtitle: string;
  if (mode === 'css') {
    subtitle = `${presets.length} mesh-style CSS gradients · click to edit · hover to copy`;
  } else if (mode === 'mesh') {
    subtitle = `${meshPresets.length} mesh gradients · click any card to edit live · drag the dots to move points`;
  } else {
    subtitle = `Blob playground · drag the dots to move shapes · load a starter to begin`;
  }

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
          onCopyBlobSvg={copyBlobSvg}
        />

        {mode === 'css' && (
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
        )}

        {mode === 'mesh' && (
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

        {mode === 'blob' && (
          <BlobEditor store={store} palette={palette} />
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
