/* -------------------------------------------------------------------------- */
/*  Self-sketching industrial safety helmet blueprint                         */
/*                                                                            */
/*  A side-profile hard hat drawn entirely with strokes. No fills, no images. */
/*  `progress` (0 → 1) drives every path on and off in structural order.      */
/* -------------------------------------------------------------------------- */

type Cmd =
  | ["M", number, number]
  | ["L", number, number]
  | ["C", number, number, number, number, number, number];

type Pt = readonly [number, number];

/**
 * Draws a detailed technical wireframe safety helmet in local space.
 *
 * The caller positions, scales and centres the context; this helper no longer
 * measures the canvas or applies its own fit, so it composes with the other
 * specimens. Local units are CSS pixels and the shell centre is the origin.
 * All context state is restored when finished.
 *
 * @param ctx      2D context
 * @param progress 0 = empty, 1 = fully drawn
 */
export function drawHelmet(ctx: CanvasRenderingContext2D, progress: number): void {
  const CYAN = "#38BDF8";
  const ORANGE = "#FF5722";
  const TAU = Math.PI * 2;

  const p = Math.max(0, Math.min(1, progress));
  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

  /** Map global progress into a local "sketch window", with a soft ease. */
  const win = (start: number, end: number) => {
    const t = clamp01((p - start) / (end - start));
    return t * t * (3 - 2 * t);
  };

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  /* ------------------------------ path maths ----------------------------- */

  const measure = (cmds: readonly Cmd[]) => {
    let total = 0;
    let cx = 0;
    let cy = 0;

    for (const cmd of cmds) {
      if (cmd[0] === "M") {
        cx = cmd[1];
        cy = cmd[2];
      } else if (cmd[0] === "L") {
        total += Math.hypot(cmd[1] - cx, cmd[2] - cy);
        cx = cmd[1];
        cy = cmd[2];
      } else {
        const [, x1, y1, x2, y2, x, y] = cmd;
        const steps = 36;
        let px = cx;
        let py = cy;

        // Sample the cubic to approximate arc length for the dash reveal.
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const mt = 1 - t;
          const nx =
            mt * mt * mt * cx +
            3 * mt * mt * t * x1 +
            3 * mt * t * t * x2 +
            t * t * t * x;
          const ny =
            mt * mt * mt * cy +
            3 * mt * mt * t * y1 +
            3 * mt * t * t * y2 +
            t * t * t * y;
          total += Math.hypot(nx - px, ny - py);
          px = nx;
          py = ny;
        }

        cx = x;
        cy = y;
      }
    }

    return total;
  };

  const trace = (cmds: readonly Cmd[]) => {
    for (const cmd of cmds) {
      if (cmd[0] === "M") {
        ctx.moveTo(cmd[1], cmd[2]);
      } else if (cmd[0] === "L") {
        ctx.lineTo(cmd[1], cmd[2]);
      } else {
        ctx.bezierCurveTo(cmd[1], cmd[2], cmd[3], cmd[4], cmd[5], cmd[6]);
      }
    }
  };

  /** Stroke an open path from 0 → amount using a measured dash reveal. */
  const line = (
    cmds: readonly Cmd[],
    amount: number,
    color: string,
    width = 1.5,
    alpha = 1,
    glow = 4,
  ) => {
    if (amount <= 0.001) return;

    const length = measure(cmds);
    if (length <= 0.01) return;

    ctx.save();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.globalAlpha *= alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
    ctx.beginPath();
    trace(cmds);

    if (amount < 0.999) {
      ctx.setLineDash([Math.max(0.1, length * amount), length + 20]);
      ctx.lineDashOffset = 0;
    }

    ctx.stroke();
    ctx.restore();
  };

  /** Reveal a microscopic circular port with a clockwise arc. */
  const port = (
    x: number,
    y: number,
    radius: number,
    amount: number,
    color: string,
    width = 1.1,
    alpha = 1,
    glow = 4,
  ) => {
    if (amount <= 0.001) return;

    ctx.save();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.globalAlpha *= alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, amount));
    ctx.stroke();
    ctx.restore();
  };

  const poly = (points: readonly Pt[], closed = true): Cmd[] => {
    const cmds: Cmd[] = [["M", points[0][0], points[0][1]]];
    for (let i = 1; i < points.length; i++) {
      cmds.push(["L", points[i][0], points[i][1]]);
    }
    if (closed) {
      cmds.push(["L", points[0][0], points[0][1]]);
    }
    return cmds;
  };

  /* ------------------------------- geometry ------------------------------ */
  /* Local units are CSS pixels. The crown faces right. Origin is the centre  */
  /* of the shell, so the main dome is roughly 300 × 200 with the harness.    */

  // Main crown: rear lower rim → smooth dome → front lower rim.
  const shell: Cmd[] = [
    ["M", -138, 18],
    ["C", -144, -26, -116, -68, -72, -90],
    ["C", -38, -107, 6, -108, 44, -98],
    ["C", 88, -86, 122, -48, 132, 8],
  ];

  // Parallel inner line gives the shell visible wall thickness.
  const shellInner: Cmd[] = [
    ["M", -130, 15],
    ["C", -136, -22, -110, -61, -70, -83],
    ["C", -38, -99, 3, -100, 39, -91],
    ["C", 81, -80, 113, -45, 123, 4],
  ];

  // Thick, angular side-impact perimeter band (dual lines + orange ties).
  const bandOuter = poly(
    [
      [-138, 18],
      [-112, 34],
      [-44, 40],
      [38, 40],
      [104, 31],
      [132, 8],
    ],
    false,
  );
  const bandInner = poly(
    [
      [-132, 10],
      [-108, 24],
      [-44, 28],
      [38, 28],
      [98, 22],
      [126, 2],
    ],
    false,
  );
  const bandTieRear = poly([[-68, 28], [-66, 39]], false);
  const bandTieFront = poly([[56, 28], [54, 40]], false);

  // Raised centre crest / ventilation channel. The two contours plus the
  // orange cross-dividers read as a segmented rectangular ridge block.
  const crestBase: Cmd[] = [
    ["M", -108, -55],
    ["C", -82, -81, -44, -99, -6, -104],
    ["C", 30, -107, 62, -98, 80, -80],
  ];
  const crestTop: Cmd[] = [
    ["M", -112, -68],
    ["C", -84, -95, -44, -113, -4, -118],
    ["C", 34, -121, 68, -111, 88, -90],
  ];
  const crestEndRear = poly([[-108, -55], [-112, -68]], false);
  const crestEndFront = poly([[80, -80], [88, -90]], false);
  const crestDividers = [
    poly([[-80, -84], [-84, -98]], false),
    poly([[-45, -98], [-48, -112]], false),
    poly([[-8, -104], [-9, -118]], false),
    poly([[30, -103], [32, -117]], false),
    poly([[62, -96], [66, -109]], false),
  ];

  // Two mirrored pairs of recessed contour ribs.
  const ribs: Cmd[][] = [
    [["M", -124, 12], ["C", -132, -26, -104, -68, -58, -88]],
    [["M", -106, 20], ["C", -112, -18, -86, -54, -44, -74]],
    [["M", 122, 8], ["C", 128, -28, 100, -68, 54, -90]],
    [["M", 104, 16], ["C", 108, -16, 84, -52, 44, -76]],
  ];

  // Long, low safety brim with a rolled under-edge.
  const brimTop: Cmd[] = [
    ["M", 108, -8],
    ["C", 134, -12, 156, -17, 178, -20],
  ];
  const brimTip: Cmd[] = [
    ["M", 178, -20],
    ["C", 181, -16, 180, -12, 176, -10],
  ];
  const brimLower: Cmd[] = [
    ["M", 176, -10],
    ["C", 150, -2, 126, 4, 108, 8],
  ];
  const brimRoll: Cmd[] = [
    ["M", 172, -14],
    ["C", 148, -5, 124, 1, 106, 4],
  ];
  const brimFill = poly(
    [
      [106, -8],
      [178, -20],
      [176, -10],
      [108, 8],
      [106, 4],
    ],
    true,
  );

  // Short chin strap, cinched beneath the shell.
  const chinRear: Cmd[] = [
    ["M", -104, 22],
    ["C", -98, 44, -72, 62, -42, 69],
  ];
  const chinFront: Cmd[] = [
    ["M", 102, 18],
    ["C", 92, 42, 68, 59, 42, 69],
  ];
  const chinCup = poly(
    [
      [-42, 65],
      [42, 65],
      [46, 73],
      [42, 81],
      [-42, 81],
      [-46, 73],
    ],
    true,
  );

  // Rear ratchet adjustment dial.
  const ratchetX = -89;
  const ratchetY = 12;

  // Five-dot rear-temple ventilation / sensor matrix.
  const vents: Pt[] = [
    [-116, -6],
    [-109, -2],
    [-102, 1],
    [-95, 3],
    [-88, 4],
  ];
  const ventGuide = poly([[-119, -8], [-85, 5]], false);

  /* -------------------------------- drawing ------------------------------ */
  /* Depth order: shell, brim and hardware, then the short chin strap in      */
  /* front. The strap stays tight under the shell so the silhouette still     */
  /* reads as a hard hat rather than a full oval.                             */

  line(shell, win(0.0, 0.17), CYAN, 1.5, 0.95, 4);
  line(shellInner, win(0.03, 0.19), CYAN, 1.0, 0.42, 2);

  line(bandOuter, win(0.15, 0.28), CYAN, 1.5, 0.9, 4);
  line(bandInner, win(0.17, 0.3), CYAN, 1.0, 0.65, 2);
  line(bandTieRear, win(0.27, 0.32), ORANGE, 1.0, 0.7, 3);
  line(bandTieFront, win(0.28, 0.33), ORANGE, 1.0, 0.7, 3);

  line(crestBase, win(0.3, 0.41), CYAN, 1.3, 0.85, 3);
  line(crestTop, win(0.31, 0.43), CYAN, 1.6, 0.95, 4);
  line(crestEndRear, win(0.4, 0.44), ORANGE, 1.0, 0.8, 3);
  line(crestEndFront, win(0.41, 0.45), ORANGE, 1.0, 0.8, 3);
  crestDividers.forEach((divider, index) => {
    line(divider, win(0.4 + index * 0.008, 0.44 + index * 0.008), ORANGE, 1.0, 0.65, 3);
  });

  ribs.forEach((rib, index) => {
    line(rib, win(0.44 + index * 0.014, 0.54 + index * 0.014), CYAN, 1.0, 0.6, 2);
  });

  line(brimTop, win(0.55, 0.64), CYAN, 1.6, 0.95, 4);
  line(brimTip, win(0.63, 0.66), ORANGE, 1.2, 0.85, 3);
  line(brimLower, win(0.64, 0.7), CYAN, 1.3, 0.78, 3);
  line(brimRoll, win(0.66, 0.72), CYAN, 1.0, 0.45, 2);

  const brimFillAlpha = win(0.56, 0.67);
  if (brimFillAlpha > 0.001) {
    ctx.save();
    ctx.globalAlpha *= brimFillAlpha * 0.06;
    ctx.fillStyle = CYAN;
    ctx.beginPath();
    trace(brimFill);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  line(ventGuide, win(0.7, 0.73), CYAN, 0.6, 0.22, 0);
  vents.forEach(([x, y], index) => {
    port(
      x,
      y,
      1.55,
      win(0.71 + index * 0.01, 0.76 + index * 0.01),
      ORANGE,
      1.0,
      0.9,
      4,
    );
  });

  // Rear ratchet dial.
  port(ratchetX, ratchetY, 7.5, win(0.76, 0.82), CYAN, 1.1, 0.75, 3);
  port(ratchetX, ratchetY, 3.1, win(0.8, 0.84), ORANGE, 1.1, 0.9, 3);
  line(
    poly(
      [
        [ratchetX - 5, ratchetY - 4],
        [ratchetX + 1, ratchetY - 2],
      ],
      false,
    ),
    win(0.82, 0.86),
    CYAN,
    0.8,
    0.6,
    2,
  );
  line(
    poly(
      [
        [ratchetX - 5, ratchetY + 4],
        [ratchetX + 1, ratchetY + 2],
      ],
      false,
    ),
    win(0.83, 0.87),
    CYAN,
    0.8,
    0.6,
    2,
  );

  // Short chin strap and its buckle.
  line(chinRear, win(0.78, 0.9), CYAN, 1.0, 0.58, 2);
  line(chinFront, win(0.8, 0.92), CYAN, 1.0, 0.58, 2);
  line(chinCup, win(0.92, 0.98), ORANGE, 1.0, 0.72, 3);

  ctx.restore();
}
