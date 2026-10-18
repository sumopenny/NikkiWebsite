import manifest from './data/imageManifest.json'
type Asset = { src: string; small: string; width: number; smallWidth: number }
const entries: Record<string, Asset> = manifest
const bySource = new Map(Object.values(entries).map(asset => [asset.src, asset]))
const asset = (src: string) => entries[src] ?? bySource.get(src)
export const imageSource = (src: string): string => asset(src)?.src ?? src
export const imageSrcset = (src: string): string | undefined => {
  const value = asset(src)
  return value && value.width > value.smallWidth
    ? value.small + ' ' + value.smallWidth + 'w, ' + value.src + ' ' + value.width + 'w'
    : undefined
}
export function setImageRequest(image: HTMLImageElement, src: string, sizes: string): void {
  const srcset = imageSrcset(src)
  image.sizes = sizes
  if (srcset) image.srcset = srcset
  image.src = imageSource(src)
}
