import { useEffect, useRef } from 'react';
import * as pdfJS from "pdfjs-dist";

import './App.css'
import { useDraggable } from '../hooks/useDraggable';
import interact from 'interactjs';

function App() {
  const droppableRef = useRef<HTMLCanvasElement>(null);
  const draggable = useDraggable();

  if (droppableRef && droppableRef.current) {
    interact(droppableRef.current)
      .dropzone({
        overlap: 0.75
      })
      .on('dropactivate', (event: Interact.InteractEvent) => {
        console.log("dropactivate");
        return event;
      })
      .on("drop", (event: Interact.InteractEvent) => {
        console.log("dropped at");
        return event;
      });
    // .on("dropactivate", (event: Interact.InteractEvent) => {
    //   event.target.classList.add("bg-orange-200")
    // })
    // .on("dragenter", (event: Interact.InteractEvent) => {
    //   console.log("enter");
    //   const draggableElement = event.relatedTarget;
    //   const dropzoneElement = event.target;

    //   dropzoneElement.classList.add("bg-blue-200");
    //   if (draggableElement) {
    //     draggableElement.classList.add("bg-orange-400");
    //     draggableElement.textContent = "ON THE PDF ALREADY";
    //   }
    // })
    // .on("dragleave", (event: Interact.InteractEvent) => {
    //   const draggableElement = event.relatedTarget;
    //   const dropzoneElement = event.target;

    //   dropzoneElement.classList.remove("bg-blue-200");
    //   if (draggableElement) {
    //     draggableElement.classList.remove("bg-orange-400");
    //     draggableElement.textContent = "DRAG LEAVING";
    //   }
    // })
    // .on("drop", (event: Interact.InteractEvent) => {
    //   console.log("drop");
    //   const draggableElement = event.relatedTarget;
    //   const droppableElement = event.target;
    //   if (draggableElement) {
    //     const droppableElementY = droppableElement.getBoundingClientRect().y as any
    //     const { x, y } = event.relatedTarget?.getBoundingClientRect() as any;
    //     draggableElement.textContent = `DROPPED: ${x} - ${y - droppableElementY}`;
    //   }
    // })
    // .on("dropdeactivate", (event: Interact.InteractEvent) => {
    //   event.target.classList.remove("bg-blue-200");
    //   event.target.classList.remove("bg-blue-200");
    // })
  }


  useEffect(() => {
    (async function () {
      // We import this here so that it's only loaded during client-side rendering.
      pdfJS.GlobalWorkerOptions.workerSrc = await import("pdfjs-dist/build/pdf.worker.entry")
      const pdf = await pdfJS.getDocument('https://storage.googleapis.com/memoapp-dev-public/public_pdf.pdf').promise;

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      // Prepare canvas using PDF page dimensions.
      const canvas = droppableRef.current;

      if (!canvas) return;
      const canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context.
      const renderContext = { canvasContext, viewport };
      page.render(renderContext);
    })();
  }, []);
  return (
    <>

      <div className="w-full bg-white fixed p-8">
        <h4>This is a dnd-app</h4>
      </div>
      <div className="w-full h-auto flex flex-row bg-gray-200">
        <div className="w-1/5 bg-white h-screen fixed p-8 mt-20">
          <div ref={draggable.ref as React.RefObject<HTMLDivElement>} className="w-auto h-auto bg-red-400 p-2 cursor-pointer block z-50" style={draggable.style}>
            <p>Drag from here: {draggable.position.x} - {draggable.position.y} </p>
          </div>
        </div>

        <div className="w-full h-auto flex items-start justify-center mt-24 ml-48">
          <div className="w-auto h-auto m-10 relative">
            <canvas id="pdf-viewer" ref={droppableRef}></canvas>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
