export interface Point {
    x: number;
    y: number;
}

export class Pen {
    bitmap: Bitmap = [[1]];
    center: Point = { x: 0, y: 0 };
    color: PenColor = -1;
}

export type PenColor = -1 | 0 | 1;

export enum Tool {
    PEN,
    FILL,
    LINE
}

export type Bit = 1 | 0;
export type Bitmap = Bit[][];

export class BitmapEditor {
    static resize(bitmap: Bitmap, width: number, height: number): Bitmap {
        const h = bitmap.length;
        const w = h > 0 ? bitmap[0].length : 0;
        for (let i = 0; i < height - h; i++) {
            bitmap.push([]);
        }
        if (h > height) {
            bitmap.splice(bitmap.length - (h - height));
        }
        for (let j = 0; j < bitmap.length; j++) {
            const bw = bitmap[j].length;
            for (let i = 0; i < width - bw; i++) {
                bitmap[j].push(0);
            }
            if (w > width) {
                bitmap[j].splice(bitmap[j].length - (w - width));
            }
        }
        return bitmap;
    }
    static paint(bitmap: Bitmap, args: { pen: Pen; loc: Point }): Bitmap {
        const c = args.pen.color;
        if (c == -1) return bitmap;

        const xmin = args.loc.x - args.pen.center.x;
        const xmax = xmin + args.pen.bitmap[0].length;
        const ymin = args.loc.y - args.pen.center.y;
        const ymax = ymin + args.pen.bitmap.length;

        for (let y = ymin, py = 0; y < ymax; y++, py++) {
            if (y < 0 || y >= bitmap.length) continue;
            for (let x = xmin, px = 0; x < xmax; x++, px++) {
                if (x < 0 || x >= bitmap[0].length) continue;
                if (args.pen.bitmap[py][px] > 0) {
                    bitmap[y][x] = c;
                }
            }
        }
        return bitmap;
    }

    static line(bitmap: Bitmap, args: { p1: Point; p2: Point; pen: Pen }): Bitmap {
        let p1 = args.p1;
        let p2 = args.p2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        if (dx == 0 && dy == 0) return this.paint(bitmap, { pen: args.pen, loc: p1 });

        if (Math.abs(dx) > Math.abs(dy)) {
            // line closer to horizontal, iterate on X
            if (dx < 0) {
                const temp = p2;
                p2 = p1;
                p1 = temp;
            }
            const m = dy / dx;

            for (let x = p1.x; x <= p2.x; x++) {
                const y = p1.y + Math.round(m * (x - p1.x));
                bitmap = this.paint(bitmap, { pen: args.pen, loc: { x: x, y: y } });
            }
        } else {
            // vertical-ish line, iterate on y
            if (dy < 0) {
                const temp = p2;
                p2 = p1;
                p1 = temp;
            }
            const m = dx / dy;

            for (let y = p1.y; y <= p2.y; y++) {
                const x = p1.x + Math.round(m * (y - p1.y));
                bitmap = this.paint(bitmap, { pen: args.pen, loc: { x: x, y: y } });
            }
        }
        return bitmap;
    }

    static shiftH(bitmap: Bitmap, px: number): Bitmap {
        for (const i in bitmap) {
            const p = bitmap[i].splice(0, px < 0 ? -px : bitmap[i].length - px);
            bitmap[i] = bitmap[i].concat(p);
        }
        return bitmap;
    }
    static shiftV(bitmap: Bitmap, px: number): Bitmap {
        const p = bitmap.splice(0, px < 0 ? -px : bitmap.length - px);
        bitmap = bitmap.concat(p);
        return bitmap;
    }
    static flipH(bitmap: Bitmap): Bitmap {
        for (const i in bitmap) bitmap[i].reverse();
        return bitmap;
    }
    static flipV(bitmap: Bitmap): Bitmap {
        bitmap.reverse();
        return bitmap;
    }
    static floodFill(bitmap: Bitmap, args: { pen: Pen; loc: Point }): Bitmap {
        if (args.loc.y < 0 || args.loc.y >= bitmap.length || args.loc.x < 0 || args.loc.x >= bitmap[0].length)
            return bitmap;

        const q: number[][] = [[args.loc.x, args.loc.y]];
        const rc = bitmap[args.loc.y][args.loc.x];
        const tc = args.pen.color != -1 ? args.pen.color : rc == 0 ? 1 : 0;

        if (rc == tc) return bitmap;

        while (q.length > 0) {
            const p = q.pop()!;
            const x = p[0];
            const y = p[1];

            if (x > 0 && bitmap[y][x - 1] == rc) q.push([x - 1, y]);
            if (x < bitmap[0].length - 1 && bitmap[y][x + 1] == rc) q.push([x + 1, y]);
            if (y > 0 && bitmap[y - 1][x] == rc) q.push([x, y - 1]);
            if (y < bitmap.length - 1 && bitmap[y + 1][x] == rc) q.push([x, y + 1]);

            bitmap[y][x] = tc;
        }

        return bitmap;
    }
}

export class BitmapRenderer {
    static RenderBitmap(bitmap: Bitmap, pen: { pen: Pen; loc: Point }): ImageData | null {
        const h = bitmap.length;
        const w = h > 0 ? bitmap[0].length : 0;
        if (w == 0 || h == 0) return null;
        const img = new ImageData(w, h);

        let idx = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                img.data[idx++] = bitmap[y][x] > 0 ? 0 : 255;
                img.data[idx++] = bitmap[y][x] > 0 ? 0 : 255;
                img.data[idx++] = bitmap[y][x] > 0 ? 0 : 255;
                img.data[idx++] = 255;
            }
        }

        // render preview of pen
        const p = pen.loc;

        if (p.x >= 0 && p.x < w && p.y >= 0 && p.y < h) {
            const xmin = p.x - pen.pen.center.x;
            const xmax = xmin + pen.pen.bitmap[0].length;
            const ymin = p.y - pen.pen.center.y;
            const ymax = ymin + pen.pen.bitmap.length;

            for (let y = ymin, py = 0; y < ymax; y++, py++) {
                if (y < 0 || y >= bitmap.length) continue;
                for (let x = xmin, px = 0; x < xmax; x++, px++) {
                    if (x < 0 || x >= bitmap[0].length) continue;
                    if (pen.pen.bitmap[py][px] > 0) {
                        idx = (y * w + x) * 4;
                        const c = img.data[idx] == 0;
                        img.data[idx++] = c ? 85 : 170;
                        img.data[idx++] = c ? 85 : 170;
                        img.data[idx++] = c ? 85 : 170;
                        img.data[idx++] = 255;
                    }
                }
            }
        }
        return img;
    }
}

export const PENS = [
    {
        center: { x: 0, y: 0 },
        bitmap: [[1]] as Bitmap
    },
    {
        center: { x: 0, y: 0 },
        bitmap: [
            [1, 1],
            [1, 1]
        ] as Bitmap
    },
    {
        center: { x: 1, y: 1 },
        bitmap: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ] as Bitmap
    },
    {
        center: { x: 0, y: 0 },
        bitmap: [[1]] as Bitmap
    },
    {
        center: { x: 1, y: 1 },
        bitmap: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ] as Bitmap
    },
    {
        center: { x: 1, y: 1 },
        bitmap: [
            [0, 1, 1, 0],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [0, 1, 1, 0]
        ] as Bitmap
    }
];
