// Bare layout for engine preview (no studio chrome).
// Rendered inside an iframe by PreviewClient.
import "@xusmo/engine/components/styles.css";

export default function EnginePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
