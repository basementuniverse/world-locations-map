import React, { useState, useRef, useEffect, useCallback, Ref } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import * as worldMap from './world.svg';
import './index.css';
import './loading-spinner.css';

const DEFAULT_BACKGROUND_COLOUR = '#333';
const DEFAULT_FOREGROUND_COLOUR = '#555';
const DEFAULT_LOCATION_COLOUR = '#0c4';
const DEFAULT_LOCATION_SIZE = 0.01;
const LOCATION_TRANSLATION_OFFSET = { x: -0.07, y: -0.2 };
const LOCATION_SCALE_OFFSET = { x: 1.1, y: 1.8 };
const PADDING = 0.1;

declare type Location = {
  long: number,
  lat: number,
  label?: string,
  size?: number,
  colour?: string,
};

declare type Vector = {
  x: number,
  y: number,
};

const LoadingSpinner = () => (<div className="loading-spinner"></div>);

const vectorAdd = (a: Vector, b: Vector|number): Vector => typeof b === 'number'
  ? ({ x: a.x + b, y: a.y + b })
  : ({ x: a.x + b.x, y: a.y + b.y });

const vectorSub = (a: Vector, b: Vector|number): Vector => typeof b === 'number'
  ? ({ x: a.x - b, y: a.y - b })
  : ({ x: a.x - b.x, y: a.y - b.y });

const vectorMul = (a: Vector, b: Vector|number): Vector => typeof b === 'number'
  ? ({ x: a.x * b, y: a.y * b })
  : ({ x: a.x * b.x, y: a.y * b.y });

const Canvas = React.forwardRef(
  (
    props: Record<string, any>,
    ref: Ref<HTMLCanvasElement>
  ) => <canvas ref={ref} {...props} />
);

function draw(
  context: CanvasRenderingContext2D|null,
  worldMapImage: HTMLImageElement|null,
  background?: string,
  foreground?: string,
  locations?: Location[],
) {
  if (context === null || worldMapImage === null) {
    return;
  }
  const size = {
    x: context.canvas.width,
    y: context.canvas.height
  };
  const padding = vectorMul(size, PADDING);
  const paddedSize = vectorSub(size, vectorMul(padding, 2));
  const translate = vectorMul(size, LOCATION_TRANSLATION_OFFSET);
  const scale = LOCATION_SCALE_OFFSET;

  context.clearRect(0, 0, size.x, size.y);
  context.fillStyle = background ?? DEFAULT_BACKGROUND_COLOUR;
  context.fillRect(0, 0, size.x, size.y);

  // Draw world map
  const worldMapCanvas = document.createElement('canvas');
  const worldMapContext = worldMapCanvas.getContext('2d');
  if (worldMapContext === null) {
    return;
  }
  worldMapCanvas.width = size.x;
  worldMapCanvas.height = size.y;
  worldMapContext.drawImage(
    worldMapImage,
    padding.x,
    padding.y,
    paddedSize.x,
    paddedSize.y
  );
  worldMapContext.globalCompositeOperation = 'source-atop';
  worldMapContext.fillStyle = foreground ?? DEFAULT_FOREGROUND_COLOUR;
  worldMapContext.fillRect(0, 0, size.x, size.y);
  context.drawImage(worldMapCanvas, 0, 0, size.x, size.y);

  // Draw locations
  if (locations && locations.length) {
    locations.forEach(location => {
      const mercatorPosition = convertMercator(
        location.lat,
        location.long,
      );
      drawLocation(
        context,
        mercatorPosition.x * paddedSize.x * scale.x + padding.x + translate.x,
        mercatorPosition.y * paddedSize.y * scale.y + padding.y + translate.y,
        location.size ?? DEFAULT_LOCATION_SIZE,
        location.colour ?? DEFAULT_LOCATION_COLOUR
      );
    });
  }
}

function drawLocation(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  colour: string
) {
  const actualSize = size * Math.max(context.canvas.width, context.canvas.height);
  context.save();
  context.translate(x, y);
  context.strokeStyle = colour;
  context.lineWidth = Math.ceil(actualSize * 0.5);
  context.beginPath();
  context.arc(0, 0, actualSize, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function convertMercator(lat: number, long: number): { x: number, y: number } {
  const x = (long + 180) * 1 / 360;
  const latRadians = lat * Math.PI / 180;
  const mercator = Math.log(Math.tan((Math.PI / 4) + (latRadians / 2)));
  const y = 0.5 - mercator / (2 * Math.PI);
  return { x, y };
}

export function WorldLocationsMap({
  background,
  foreground,
  locations,
}: {
  background?: string,
  foreground?: string,
  locations: Location[],
}) {
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let context: CanvasRenderingContext2D|null = null;
  let worldMapImage: HTMLImageElement|null = null;

  useEffect(() => {
    if (canvasRef.current !== null) {
      context = canvasRef.current.getContext('2d');
    }

    // Load world map image
    worldMapImage = new Image();
    worldMapImage.src = worldMap.default;
    worldMapImage.onload = () => {
      setLoading(false);
      draw(context, worldMapImage, background, foreground, locations);
    };
  }, []);

  // Handle resize
  const onResize = useCallback((width, height) => {
    if (canvasRef.current !== null) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      draw(context, worldMapImage, background, foreground, locations);
    }
  }, []);
  const { ref: resizeRef } = useResizeDetector({ onResize });

  return (
    <div
      ref={resizeRef}
      className="world-location-map"
    >
      <Canvas ref={canvasRef} />
      {loading && <LoadingSpinner />}
    </div>
  );
}
