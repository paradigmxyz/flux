import { useEffect, useState } from "react";

export function useDebouncedEffect(
  callback: () => void,
  timeout: number,
  deps: any[]
): boolean {
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    setIsWaiting(true);

    const handler = setTimeout(() => {
      callback();

      setIsWaiting(false);
    }, timeout);

    // This line is secret sauce: cancel the
    // timeout if the effect gets triggered again.
    return () => clearTimeout(handler);
  }, [timeout, ...deps]);

  return isWaiting; // Useful for showing loading animations, etc.
}
