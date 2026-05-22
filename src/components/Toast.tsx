import { useEffect, useState } from "react";

interface Props {
  message: string;
  onDone: () => void;
}

export function Toast({ message, onDone }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 2200);
    const remove = setTimeout(onDone, 2700);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [onDone]);

  return (
    <div className={`toast${visible ? " toast--visible" : ""}`}>
      {message}
    </div>
  );
}
