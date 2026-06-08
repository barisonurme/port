'use client';

import { useState } from 'react';
import GridDistortion from './GridDistortion';
import Lightfall, { LightfallProps } from './Lightfall';
import SideRays from './SideRays';
import PrismaticBurst, { PrismaticBurstProps } from './PrismaticBurst';
import type { ComponentProps } from 'react';

type SideRaysProps = ComponentProps<typeof SideRays>;

interface HeroDistortionProps {
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  glitchInterval?: number;
  glitchStrength?: number;
  className?: string;
  imageSrc?: string;
  lightfall?: LightfallProps;
  sideRays?: SideRaysProps;
  prismaticBurst?: PrismaticBurstProps;
}

export default function HeroDistortion({
  grid = 6,
  mouse = 0.43,
  strength = 0.15,
  relaxation = 0.9,
  glitchInterval = 3,
  glitchStrength = 12,
  className = '',
  imageSrc,
  lightfall,
  sideRays,
  prismaticBurst,
}: HeroDistortionProps) {
  const [lightfallCanvas, setLightfallCanvas] = useState<HTMLCanvasElement | null>(null);
  const [prismaticCanvas, setPrismaticCanvas] = useState<HTMLCanvasElement | null>(null);

  const liveCanvas = imageSrc ? null : (prismaticCanvas ?? lightfallCanvas);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {lightfall && (
        <div className="absolute inset-0 opacity-0 pointer-events-none">
          <Lightfall
            preserveDrawingBuffer
            onCanvasReady={setLightfallCanvas}
            {...lightfall}
          />
        </div>
      )}
      {sideRays && (
        <div className="absolute inset-0 pointer-events-none">
          <SideRays {...sideRays} />
        </div>
      )}
      {prismaticBurst && (
        <div className="absolute inset-0 opacity-0 pointer-events-none">
          <PrismaticBurst
            preserveDrawingBuffer
            onCanvasReady={setPrismaticCanvas}
            {...prismaticBurst}
          />
        </div>
      )}
      <GridDistortion
        imageSrc={imageSrc}
        liveCanvas={liveCanvas}
        grid={grid}
        mouse={mouse}
        strength={strength}
        relaxation={relaxation}
        glitchInterval={glitchInterval}
        glitchStrength={glitchStrength}
      />
    </div>
  );
}
