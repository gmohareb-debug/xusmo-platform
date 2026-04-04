// Bare layout for engine preview (no studio chrome).
// Rendered inside an iframe by PreviewClient.
import "./preview.css";
import "@xusmo/engine/components/styles.css"; // keep for backwards compat

export default function EnginePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
