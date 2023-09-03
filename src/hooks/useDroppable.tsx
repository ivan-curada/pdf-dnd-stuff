import interact from "interactjs";

export const useDroppable = (ref: React.RefObject<HTMLElement>) => {
    if (ref && ref.current) {
        interact(ref.current)
        .dropzone({
            accept: ".test",
            overlap: 0.5
        })
        .on("dropactivate", (event: Interact.InteractEvent) => {
            event.target.classList.add("bg-orange-200")
        })
        .on("dragenter", (event: Interact.InteractEvent) => {
            const draggableElement = event.relatedTarget;
            const dropzoneElement = event.target;

            dropzoneElement.classList.add("bg-blue-200");
            if (draggableElement) {
                draggableElement.classList.add("bg-orange-400");
                draggableElement.textContent = "ON THE PDF ALREADY";
            }
        })
        .on("dragleave", (event: Interact.InteractEvent) => {
            const draggableElement = event.relatedTarget;
            const dropzoneElement = event.target;

            dropzoneElement.classList.remove("bg-blue-200");
            if (draggableElement) {
                draggableElement.classList.remove("bg-orange-400");
                draggableElement.textContent = "DRAG LEAVING";
            }
        })
        .on("drop", (event: Interact.InteractEvent) => {
            console.log("drop");
            const draggableElement = event.relatedTarget;
            if (draggableElement) {
                draggableElement.style.color = "#fff";
                draggableElement.textContent = "DROPPED";
            }
        })
        .on("dropdeactivate", (event: Interact.InteractEvent) => {
            event.target.classList.remove("bg-blue-200");
            event.target.classList.remove("bg-blue-200");
        })
    }

    console.log(ref.current);

    return {
        ref: ref,
    }
}