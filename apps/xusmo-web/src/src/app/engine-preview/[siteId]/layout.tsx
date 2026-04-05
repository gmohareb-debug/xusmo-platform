// Bare layout for engine preview (no studio chrome).
// Rendered inside an iframe by PreviewClient.
// Tailwind is the single source of styling — loaded via preview.css
import "./preview.css";

export default function EnginePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
