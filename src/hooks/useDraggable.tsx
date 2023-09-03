import React from "react";
import interact from "interactjs";

type Partial<T> = {
  [P in keyof T]?: T[P];
};

const initialPosition = {
  width: 100,
  height: 100,
  x: 0,
  y: 0
};

export const useDraggable = (
  position: Partial<typeof initialPosition> = initialPosition
) => {
  const [elementPosition, setElementPosition] = React.useState<
    typeof initialPosition
  >({
    ...initialPosition,
    ...position
  });

  const [isEnabled, setIsEnabled] = React.useState<boolean>(true);

  const interactiveRef = React.useRef(null);

  let { x, y, width, height } = elementPosition;

  const enable = () => {
    interact((interactiveRef.current as unknown) as HTMLElement)
      .draggable({
        modifiers: [],
        inertia: false
      })
      .on("dragmove", (event) => {
        x += event.dx;
        y += event.dy;

        setElementPosition({
          width,
          height,
          x,
          y
        });
      });
  };

  const disable = () => {
    interact((interactiveRef.current as unknown) as HTMLElement).unset();
  };

  React.useEffect(() => {
    if (isEnabled) {
      enable();
    } else {
      disable();
    }
    return disable;
  }, [isEnabled]);

  return {
    ref: interactiveRef,
    style: {
      transform: `translate3D(${elementPosition.x}px, ${elementPosition.y}px, 0)`,
      width: `${elementPosition.width}px`,
      height: `${elementPosition.height}px`,
      position: "absolute" as React.CSSProperties["position"],
      touchAction: "none"
    },
    position: elementPosition,
    isEnabled,
    enable: () => setIsEnabled(true),
    disable: () => setIsEnabled(false)
  };
};