"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldLocationsMap = void 0;
const react_1 = __importStar(require("react"));
const react_resize_detector_1 = require("react-resize-detector");
const worldMap = __importStar(require("./world.svg"));
require("./index.css");
require("./loading-spinner.css");
const DEFAULT_BACKGROUND_COLOUR = '#333';
const DEFAULT_FOREGROUND_COLOUR = '#555';
const DEFAULT_LOCATION_COLOUR = '#0c4';
const DEFAULT_LOCATION_SIZE = 0.01;
const LOCATION_TRANSLATION_OFFSET = { x: -0.07, y: -0.2 };
const LOCATION_SCALE_OFFSET = { x: 1.1, y: 1.8 };
const PADDING = 0.1;
const LoadingSpinner = () => (react_1.default.createElement("div", { className: "loading-spinner" }));
const vectorAdd = (a, b) => typeof b === 'number'
    ? ({ x: a.x + b, y: a.y + b })
    : ({ x: a.x + b.x, y: a.y + b.y });
const vectorSub = (a, b) => typeof b === 'number'
    ? ({ x: a.x - b, y: a.y - b })
    : ({ x: a.x - b.x, y: a.y - b.y });
const vectorMul = (a, b) => typeof b === 'number'
    ? ({ x: a.x * b, y: a.y * b })
    : ({ x: a.x * b.x, y: a.y * b.y });
const Canvas = react_1.default.forwardRef((props, ref) => react_1.default.createElement("canvas", Object.assign({ ref: ref }, props)));
function draw(context, worldMapImage, background, foreground, locations) {
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
    context.fillStyle = background !== null && background !== void 0 ? background : DEFAULT_BACKGROUND_COLOUR;
    context.fillRect(0, 0, size.x, size.y);
    const worldMapCanvas = document.createElement('canvas');
    const worldMapContext = worldMapCanvas.getContext('2d');
    if (worldMapContext === null) {
        return;
    }
    worldMapCanvas.width = size.x;
    worldMapCanvas.height = size.y;
    worldMapContext.drawImage(worldMapImage, padding.x, padding.y, paddedSize.x, paddedSize.y);
    worldMapContext.globalCompositeOperation = 'source-atop';
    worldMapContext.fillStyle = foreground !== null && foreground !== void 0 ? foreground : DEFAULT_FOREGROUND_COLOUR;
    worldMapContext.fillRect(0, 0, size.x, size.y);
    context.drawImage(worldMapCanvas, 0, 0, size.x, size.y);
    if (locations && locations.length) {
        locations.forEach(location => {
            var _a, _b;
            const mercatorPosition = convertMercator(location.lat, location.long);
            drawLocation(context, mercatorPosition.x * paddedSize.x * scale.x + padding.x + translate.x, mercatorPosition.y * paddedSize.y * scale.y + padding.y + translate.y, (_a = location.size) !== null && _a !== void 0 ? _a : DEFAULT_LOCATION_SIZE, (_b = location.colour) !== null && _b !== void 0 ? _b : DEFAULT_LOCATION_COLOUR);
        });
    }
}
function drawLocation(context, x, y, size, colour) {
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
function convertMercator(lat, long) {
    const x = (long + 180) * 1 / 360;
    const latRadians = lat * Math.PI / 180;
    const mercator = Math.log(Math.tan((Math.PI / 4) + (latRadians / 2)));
    const y = 0.5 - mercator / (2 * Math.PI);
    return { x, y };
}
function WorldLocationsMap({ background, foreground, locations, }) {
    const [loading, setLoading] = react_1.useState(true);
    const canvasRef = react_1.useRef(null);
    let context = null;
    let worldMapImage = null;
    react_1.useEffect(() => {
        if (canvasRef.current !== null) {
            context = canvasRef.current.getContext('2d');
        }
        worldMapImage = new Image();
        worldMapImage.src = worldMap.default;
        worldMapImage.onload = () => {
            setLoading(false);
            draw(context, worldMapImage, background, foreground, locations);
        };
    }, []);
    const onResize = react_1.useCallback((width, height) => {
        if (canvasRef.current !== null) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
            draw(context, worldMapImage, background, foreground, locations);
        }
    }, []);
    const { ref: resizeRef } = react_resize_detector_1.useResizeDetector({ onResize });
    return (react_1.default.createElement("div", { ref: resizeRef, className: "world-location-map" },
        react_1.default.createElement(Canvas, { ref: canvasRef }),
        loading && react_1.default.createElement(LoadingSpinner, null)));
}
exports.WorldLocationsMap = WorldLocationsMap;
