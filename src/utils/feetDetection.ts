/**
 * Canvas-based feet detection for Runway looks (Spec Section 14).
 * Draws the look's probe image into a 48px-wide offscreen canvas, scans from
 * the bottom row upward for the last row containing any pixel with alpha > 40,
 * and returns clamp((h - 1 - lastRow) / h, 0, 0.4) for `--rw-foot`.
 * Uses crossOrigin="anonymous" and catches tainted-canvas errors safely.
 */
export function detectFootOffset(probeSrc: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const naturalW = img.naturalWidth || 48;
          const naturalH = img.naturalHeight || 64;
          const targetW = 48;
          const targetH = Math.max(1, Math.round((naturalH / naturalW) * targetW));

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve(0);
            return;
          }

          ctx.drawImage(img, 0, 0, targetW, targetH);
          const { data } = ctx.getImageData(0, 0, targetW, targetH);

          let lastRow = targetH - 1;
          let found = false;

          for (let y = targetH - 1; y >= 0; y--) {
            const rowOffset = y * targetW * 4;
            for (let x = 0; x < targetW; x++) {
              const alpha = data[rowOffset + x * 4 + 3];
              if (alpha > 40) {
                lastRow = y;
                found = true;
                break;
              }
            }
            if (found) break;
          }

          if (!found) {
            resolve(0);
            return;
          }

          const rawOffset = (targetH - 1 - lastRow) / targetH;
          const clamped = Math.max(0, Math.min(0.4, rawOffset));
          resolve(clamped);
        } catch {
          resolve(0);
        }
      };

      img.onerror = () => resolve(0);
      img.src = probeSrc;
    } catch {
      resolve(0);
    }
  });
}
