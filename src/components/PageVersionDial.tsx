import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDialKit } from 'dialkit';
import { PAGE_VERSIONS, DEFAULT_VERSION, type VersionId } from '../pageVersions';

/**
 * Top-level "Page" dialkit panel: picks the page version. Every other panel is
 * registered by the components that version mounts, so switching here swaps the
 * rest of the panel set to only the controls that apply.
 *
 * Mount this as the FIRST child of the route: dialkit lists panels in
 * registration order, and effects run in tree order, so it lands on top.
 */
export function PageVersionDial() {
  const [params, setParams] = useSearchParams();
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fromUrl = useRef(params.get('version')).current;
  const seeded: VersionId = PAGE_VERSIONS.some((v) => v.id === fromUrl)
    ? (fromUrl as VersionId)
    : DEFAULT_VERSION;

  const { version } = useDialKit('Page', {
    version: {
      type: 'select',
      options: PAGE_VERSIONS.map((v) => ({ value: v.id, label: v.label })),
      default: seeded,
    },
  }) as { version: VersionId };

  // Version is owned by the URL (Marketing reads ?version); mirror the select into it.
  useEffect(() => {
    const current = paramsRef.current;
    if (current.get('version') === version) return;
    const next = new URLSearchParams(current);
    next.set('version', version);
    setParams(next, { replace: true });
  }, [version, setParams]);

  return null;
}
