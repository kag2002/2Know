import { useState, useEffect } from "react";

export function AnimatedNumber({ value, suffix = "" }: { value: string | number; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  
  useEffect(() => {
    const strValue = String(value);
    const numMatch = strValue.match(/[\d,.]+/);
    if (!numMatch) { setDisplay(strValue); return; }
    
    const target = parseFloat(numMatch[0].replace(",", "."));
    const duration = 1200;
    const start = performance.now();
    
    let frameId: number;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(target * eased * 10) / 10;
      
      if (target % 1 !== 0) {
        setDisplay(current.toFixed(1).replace(".", ","));
      } else {
        setDisplay(Math.round(current).toString());
      }
      
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };
    
    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [value]);
  
  return (
    <span>
      {display}{suffix}
    </span>
  );
}
