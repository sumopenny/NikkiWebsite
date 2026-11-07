import manifest from './data/imageManifest.json'
type Asset = { src: string; small: string; width: number; smallWidth: number }
const entries: Record<string, Asset> = manifest
const bySource = new Map(Object.values(entries).map(asset => [asset.src, asset]))
const base = import.meta.env.BASE_URL
// Accept logical paths and already resolved paths without adding the base twice.
const logicalPath = (src: string): string =>
  base !== '/' && src.startsWith(base) ? '/' + src.slice(base.length) : src
const asset = (src: string) => entries[logicalPath(src)] ?? bySource.get(logicalPath(src))
const withBase = (src: string): string =>
  src.startsWith('/') && !src.startsWith('//') ? base + src.slice(1) : src
export const imageSource = (src: string): string => withBase(asset(src)?.src ?? logicalPath(src))
export const imageSrcset = (src: string): string | undefined => {
  const value = asset(src)
  return value && value.width > value.smallWidth
    ? withBase(value.small) + ' ' + value.smallWidth + 'w, ' + withBase(value.src) + ' ' + value.width + 'w'
    : undefined
}
export function setImageRequest(image: HTMLImageElement, src: string, sizes: string): void {
  const srcset = imageSrcset(src)
  image.sizes = sizes
  if (srcset) image.srcset = srcset
  image.src = imageSource(src)
}
