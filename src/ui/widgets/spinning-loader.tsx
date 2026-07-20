import { useEffect, useRef } from "react";

import {
  LoaderCircleIcon,
  type LoaderCircleIconHandle,
} from "@/ui/icons/loader-circle";

/** Loader that spins continuously (lucide-animated only animates on hover by default). */
export function SpinningLoader({ size = 16 }: { size?: number }) {
  const ref = useRef<LoaderCircleIconHandle>(null);

  useEffect(() => {
    void ref.current?.startAnimation();
    return () => {
      void ref.current?.stopAnimation();
    };
  }, []);

  return <LoaderCircleIcon ref={ref} size={size} aria-hidden />;
}
