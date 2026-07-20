import { useEffect, useRef } from "react";

import {
  LoaderCircleIcon,
  type LoaderCircleIconHandle,
} from "@/ui/icons/loader-circle";

/** Loader that spins continuously (lucide-animated only animates on hover by default). */
export function SpinningLoader({ size = 16 }: { size?: number }) {
  const ref = useRef<LoaderCircleIconHandle>(null);

  useEffect(() => {
    const result = ref.current?.startAnimation();
    Promise.resolve(result).catch(() => undefined);
    return () => {
      const stopResult = ref.current?.stopAnimation();
      Promise.resolve(stopResult).catch(() => undefined);
    };
  }, []);

  return <LoaderCircleIcon aria-hidden ref={ref} size={size} />;
}
