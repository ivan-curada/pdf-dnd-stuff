
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import * as pdfJS from "pdfjs-dist";
import { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

type Position = {
  x: number,
  y: number,
  height: number,
  width: number
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformerRef = useRef<any>(null);

  const shapeRef = useRef<any>(null);

  const [placeholders, setPlaceholders] = useState([
    {
      id: "approver-1",
      position: {
        x: 0,
        y: 0,
        height: 50,
        width: 100
      },
      isSelected: false,
    }
  ]);

  const [showCanvas, setShowCanvas] = useState(false);
  const [showDraggables, setShowDraggables] = useState(false);

  useEffect(() => {
    let pdf: PDFDocumentProxy | null = null;
    let renderTask: RenderTask | null = null;

    (async function () {
      setShowCanvas(true);
      // We import this here so that it's only loaded during client-side rendering.
      pdfJS.GlobalWorkerOptions.workerSrc = await import("pdfjs-dist/build/pdf.worker.entry")
      let pdf = await pdfJS.getDocument('https://storage.googleapis.com/memoapp-dev-public/public_pdf.pdf').promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });

      // Prepare canvas using PDF page dimensions.
      const canvas = canvasRef.current;

      if (!canvas) return;
      const canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context.
      const renderContext = { canvasContext, viewport };
      renderTask = page.render(renderContext);
      setShowDraggables(true);
    })();

    return () => {
      if (pdf) {
        pdf.destroy();
      }

      if (renderTask) {
        renderTask.cancel()
      }
      setShowCanvas(false);
    }
  }, []);

  const onDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const index = placeholders.findIndex((element) => e.target.id() === element.id);
    const placeholder = {
      ...placeholders[index],
      isSelected: true,
      position: {
        x: e.currentTarget.x() - 1,
        y: e.currentTarget.y() - 1,
        height: e.currentTarget.height(),
        width: e.currentTarget.width()
      },
    }

    const newPlaceholders = [...placeholders];
    newPlaceholders[index] = placeholder;
    setPlaceholders(newPlaceholders);
  };

  const onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const clickedOnEmptySpace = e.target === e.target.getStage();

    if (clickedOnEmptySpace) {
      const updatedPlaceholders = placeholders.map((placeholder) => ({
        ...placeholder,
        isSelected: false
      }));

      setPlaceholders(updatedPlaceholders)
    }
  }

  const onTap = (e: KonvaEventObject<Event>) => {
    const index = placeholders.findIndex((element) => element.id === e.currentTarget.id())
    const newPlaceholders = [...placeholders];
    newPlaceholders[index] = {
      ...newPlaceholders[index],
      isSelected: true
    }

    setPlaceholders(newPlaceholders);
  }

  const onChange = (e: KonvaEventObject<Event>, position: Position) => {
    const index = placeholders.findIndex((element) => element.id === e.currentTarget.id())
    const newPlaceholders = [...placeholders];
    newPlaceholders[index] = {
      ...newPlaceholders[index],
      position: position,
      isSelected: true
    }
    setPlaceholders(newPlaceholders);
  }

  useEffect(() => {
    if (placeholders[0].isSelected) {
      // we need to attach transformer manually
      transformerRef!.current!.nodes([shapeRef.current]);
      transformerRef!.current!.getLayer().batchDraw();
    }

    console.log(placeholders);
  }, [placeholders]);

  return (
    <>
      <div className="w-full bg-white fixed p-8 z-10">
        <h4>This is a dnd-app</h4>
      </div>
      <div className="w-full h-auto flex flex-row bg-gray-200">
        <div className="w-1/5 bg-white h-screen fixed p-8 mt-20">
          <p>Test</p>
        </div>

        <div className="w-full h-auto flex items-start justify-center mt-24 ml-48">
          <div className="w-auto h-auto m-10 relative">
            {showDraggables && (
              <Stage width={canvasRef.current?.width} height={canvasRef.current?.height} className="absolute" onMouseDown={onMouseDown}>
                {placeholders.map((placeholder) => (
                  <Layer key={placeholder.id}>
                    <Text
                      x={placeholder.position.x}
                      y={placeholder.position.y}
                      width={placeholder.position.width}
                      height={placeholder.position.height}
                      text={`${placeholder.id} - ${placeholder.position.x} - ${placeholder.position.y}`}
                      align="center"
                      verticalAlign="middle"
                      draggable
                    />
                    <Rect
                      ref={shapeRef}
                      id={placeholder.id}
                      x={placeholder.position.x}
                      y={placeholder.position.y}
                      text={`${placeholder.id} - ${placeholder.position.x} - ${placeholder.position.y}`}

                      width={placeholder.position.width}
                      height={placeholder.position.height}
                      stroke="#3b498f"
                      draggable
                      onDragEnd={onDragEnd}
                      onDragMove={onDragEnd}
                      onTap={onTap}
                      onClick={onTap}
                      onTran
                      onTransformEnd={(e) => {
                        // transformer is changing scale of the node
                        // and NOT its width or height
                        // but in the store we have only width and height
                        // to match the data better we will reset scale on transform end
                        const node = shapeRef.current;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        // we will reset it back
                        node.scaleX(1);
                        node.scaleY(1);

                        const position: Position = {
                          x: node.x(),
                          y: node.y(),
                          height: Math.max(node.height() * scaleY),
                          width: Math.max(5, node.width() * scaleX)
                        }

                        onChange(e, position);
                      }}
                    />

                    {placeholder.isSelected && (
                      <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                          // limit resize
                          if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                          }
                          return newBox;
                        }}
                      />
                    )}
                  </Layer>
                ))}
              </Stage>
            )}
            {showCanvas && (
              <canvas id="pdf-viewer" ref={canvasRef}></canvas>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
