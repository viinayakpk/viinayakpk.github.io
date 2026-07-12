import { Environment, Lightformer } from "@react-three/drei";
import { useThemeColors } from "@/scenes/shared/useThemeColors";

/**
 * The shared studio lighting rig. Every 3D surface on the site is lit by this and
 * nothing else.
 *
 * WHY THIS EXISTS
 * ---------------
 * The scenes used to be lit by an ambient + directional + point light and made
 * visible with `emissive` + `toneMapped={false}` + a bloom pass. That is a
 * *dark-scene* technique: emissive and bloom only read as "glow" against black.
 * On a cream page (`--bg: #fff8f4`) they render as flat, washed-out discs, and a
 * PBR material with no environment to reflect has nothing to be shiny *with* — so
 * it collapses into a vector circle. That is the whole reason the old scenes
 * looked cheap.
 *
 * A `<Lightformer>` is drei's softbox: a flat emissive rect/circle/ring rendered
 * into an off-buffer cube map by `<Environment>`. Per drei's docs it "acts like a
 * real light without the expense — you can have as many as you want." That cube
 * map becomes the scene's envMap, which is what finally gives metal something to
 * reflect and clearcoat a highlight to roll.
 *
 * PROVENANCE
 * ----------
 * The layout below is adapted from `pmndrs/examples` → `demos/inter-epoxy-resin`,
 * which is the closest official rig to what this site needs: a hand-built
 * Lightformer studio on a near-white background (`#f2f2f5`). Its structure — one
 * very hot ceiling card, three dim side cards, one accent former, the whole thing
 * inside a tilted group — is reproduced here, with the accent former recoloured to
 * the site's brand orange.
 *   https://github.com/pmndrs/examples/blob/main/demos/inter-epoxy-resin/src/App.jsx
 *
 * NO CDN. `<Environment preset="studio">` would be one line, but drei fetches
 * preset HDRIs from `https://raw.githack.com/pmndrs/drei-assets/...` at runtime. A
 * portfolio must not depend on a third-party GitHub proxy to render. Passing
 * children instead makes the environment fully procedural: zero network, zero
 * bytes, total art direction over where the light actually comes from.
 *
 * TWO SHARP EDGES IN drei's Lightformer API, both read from its source:
 *
 *   1. `target` is IGNORED if you also pass `rotation` — the guard is literally
 *      `if (target && !props.rotation) ref.current.lookAt(...)`. So each former
 *      below uses one or the other, never both.
 *   2. `intensity` is not a light property. It does `material.color.multiplyScalar(
 *      intensity)` — it pushes an emissive colour past 1.0 so PMREM picks it up as
 *      light. That is why the key card's value looks absurd next to the fills: on a
 *      light background you need a ~10:1 key-to-fill ratio to get any modelling at
 *      all, and `inter-epoxy-resin` ships exactly that (key 20 vs fills 2).
 */
export default function StudioEnvironment() {
  const { isDark } = useThemeColors();

  return (
    <Environment
      /*
       * `frames={1}` films the cube camera once and stops. The default is Infinity,
       * which re-renders the whole environment every frame — pure waste for a rig
       * whose lights never move. The `key` forces a re-bake when the theme flips,
       * which is the only time this rig actually changes.
       */
      key={isDark ? "dark" : "light"}
      frames={1}
      /*
       * 64, not the 256 default. On a light background the env map is only shaping
       * specular and clearcoat, not supplying a legible mirror image — the shipped
       * light-bg rig drops all the way to 32. Held at 64 here only because the flow
       * packets are polished metal and do show a little of the room.
       */
      resolution={64}
      // Lights the objects; never drawn behind them. The page's own cream shows
      // through the alpha canvas instead.
      background={false}
    >
      {/*
        FRONT KEY — sits OUTSIDE the tilted group, deliberately.

        The reference rig this is adapted from lights a slab of transmissive epoxy:
        light passes *through* the subject, so a rig built almost entirely of ceiling
        and side cards works. Our subjects are opaque ceramic and metal. Ported
        as-is, that rig lit them beautifully from above and behind and left the whole
        camera-facing side in shade — the core rendered dark maroon instead of brand
        orange, and the metal satellites went nearly black.

        This card is the fix: a large, soft source high and camera-left, in FRONT of
        the subject (+z, where the camera lives). It is the light that actually puts
        colour on the faces we can see. Everything else in this rig shapes; this one
        exposes.
      */}
      <Lightformer
        intensity={isDark ? 2.4 : 5}
        color="#fff4ec"
        position={[-4, 3, 7]}
        scale={[9, 9, 1]}
        target={[0, 0, 0]}
      />

      {/*
        SPECULAR PIP — a small circle placed to land a tight, round catchlight on
        curved surfaces. Photographers put one in every product shot; it is what makes
        a sphere read as glossy rather than merely bright, and it is what the metal
        satellites now catch as they orbit.
      */}
      <Lightformer
        form="circle"
        intensity={isDark ? 3.5 : 4}
        color="#ffffff"
        position={[3, 3, 6]}
        scale={1.6}
        target={[0, 0, 0]}
      />

      {/* The tilted group is straight from the reference rig: it swings the whole
          studio off-axis so no card lines up flat with the camera, which is what
          keeps highlights raking across a surface instead of sitting dead-centre. */}
      <group rotation={[-Math.PI / 4, -0.3, 0]}>
        {/*
          KEY — the ceiling card, and the light that actually shapes every form on
          the site. It gives each object one dominant highlight and one falloff
          direction, which is the single biggest cue that a thing is a physical
          object and not a filled circle. Warm, because the page is warm.
        */}
        <Lightformer
          intensity={isDark ? 6 : 18}
          color="#fff4ec"
          rotation-x={Math.PI / 2}
          position={[0, 5, -9]}
          scale={[10, 10, 1]}
        />

        {/*
          FILLS — two dim side cards. They lift the shadow side just enough that it
          reads as "in shade" rather than "black hole". The upper one is cool against
          the warm key, which gives the shading a subtle temperature gradient — the
          thing that separates a render from flat shading with a gradient on it.
        */}
        <Lightformer
          intensity={2}
          color="#dfe9f5"
          rotation-y={Math.PI / 2}
          position={[-5, 1, -1]}
          scale={[10, 2, 1]}
        />
        <Lightformer
          intensity={2}
          color="#fffaf6"
          rotation-y={Math.PI / 2}
          position={[-5, -1, -1]}
          scale={[10, 2, 1]}
        />

        {/*
          RIM — a long strip down the opposite side. This is the classic studio trick
          and it does the most work of anything here: it draws a bright edge around
          the silhouette, separating the object from the background. On a cream page,
          where object and background are both light, silhouette separation is the
          entire ballgame. Pushed harder in dark mode, where it is the main thing
          keeping geometry from disappearing into the background.
        */}
        <Lightformer
          intensity={isDark ? 5 : 3}
          color="#ffffff"
          rotation-y={-Math.PI / 2}
          position={[10, 1, 0]}
          scale={[20, 2, 1]}
        />

        {/*
          BRAND BOUNCE — a broad accent-orange ring. This is the line that earns its
          keep: it puts `--accent` (#e8672e) into the *reflections* of every metal and
          clearcoated surface on the site. The brand colour stops being paint applied
          to objects and becomes light falling on them, which is the difference
          between "themed" and "art directed".

          No `rotation` prop here, deliberately — that is what lets `target` work.
        */}
        <Lightformer
          form="ring"
          intensity={isDark ? 2 : 2.6}
          color="#e8672e"
          scale={10}
          position={[-6, -2, -6]}
          target={[0, 0, 0]}
        />
      </group>
    </Environment>
  );
}
