import { useState } from "react";
import Button from "./Button";

interface ConfirmableButtonProps {
  children: React.ReactNode;
  onConfirm: () => void;
  className?: string;
}

export const ConfirmableButton = ({ children, onConfirm, className }: ConfirmableButtonProps) => {
  const [confirmation, setConfirmation] = useState(false);
  return (
    <div className={`flex flex-col space-y-1 ${confirmation ? "p-2 bg-blue-200 dark:bg-slate-700 rounded-lg" : ""}`}>
      {
        confirmation &&
        <>
          <p className="font-semibold">{children} ?</p>
          <Button
            className={className}
            onClick={() => setConfirmation(false)}>
            Annuler
          </Button>
        </>
      }
      <Button className={className} onClick={() => {
        if (confirmation) {
          onConfirm();
          setConfirmation(false);
        }
        else {
          setConfirmation(true);
        }
      }}>
        {confirmation ? 'Confirmer' : children}
      </Button>
    </div>
  );
}