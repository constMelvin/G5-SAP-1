import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function Toast({ message, error = false }: { message: string; error?: boolean }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (error) return;
    const timer = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, [error]);
  if (!visible) return null;
  return <div className={"app-toast" + (error ? " toast-error" : "")}>
    <span role={error ? "alert" : "status"}>{message}</span>
    <button type="button" aria-label="Dismiss notification" onClick={() => setVisible(false)}><X size={16} aria-hidden="true" /></button>
  </div>;
}
