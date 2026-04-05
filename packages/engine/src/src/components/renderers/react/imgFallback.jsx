export function onImgError(e, width = 400, height = 300) {
  const t = e.currentTarget
  if (t.dataset.fallback) return
  t.dataset.fallback = '1'
  t.src = `https://placehold.co/${width}x${height}/e2e8f0/94a3b8?text=Image`
}
