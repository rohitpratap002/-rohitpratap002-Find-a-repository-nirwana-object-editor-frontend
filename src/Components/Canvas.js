import React, { useRef, useState, useEffect } from 'react';

const Canvas = (props) => {
  const canvasRef = useRef(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Function to draw on canvas
  const draw = (ctx, path) => {
      
    ctx.lineWidth =path[0].bsize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffffff'; // white color for drawing

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    path.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  };

  // Event handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const bsize = props.brushSize;
    setCurrentPath([{ x, y , bsize}]);
    setIsDrawing(true);
  };

  const endDrawing = () => {
    if (currentPath.length > 0) {
        setCurrentPath([]);
      }
    setIsDrawing(false);
  };

  const drawOnMove = (e) => {
      
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    setCurrentPath((prevPath) => [...prevPath, { bsize: props.brushSize, x, y }]);
    if (currentPath.length > 0) {
        props.setDrawingPaths((prevPaths) => [...prevPaths, currentPath]);
      }
  };

  // Function to load image onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = props.width;
    canvas.height = props.height;
    props.drawingPaths.forEach((path) => {
      draw(ctx, path);
    });
  }, [props.width, props.height, props.drawingPaths]);

  return (
    <canvas
      id='editorCanvas'
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={endDrawing}
      onMouseMove={drawOnMove}
      style={{ cursor: 'crosshair', zIndex: "25" }}
    ></canvas>
  );
};

export default Canvas;
