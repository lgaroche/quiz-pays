import { useContext, useEffect, useState } from "react";
import { GameContext } from "./GameProvider";
import Button from "./Button";


const Sync = ({ onClose }: { onClose: () => void }) => {
  const { serialize, deserialize } = useContext(GameContext)

  const [serialized, setSerialized] = useState('')
  const [input, setInput] = useState('')

  useEffect(() => {
    const serialized = serialize()
    setSerialized(serialized)
  }, [serialize])

  return (
    <div className="flex flex-col space-y-2">
      <p className="text-left">Code de sauvegarde:</p>
      <pre className="text-wrap break-words dark:bg-slate-700 rounded-lg p-3">
        {serialized}
      </pre>
      <input
        type="text"
        id="sync"
        placeholder="Charger un code"
        className="font-semibold text-xl rounded-lg p-1 px-2"
        onChange={(e) => setInput(e.target.value)}
      />
      <Button onClick={() => deserialize(input)}>Charger</Button >
      <Button onClick={onClose}>Fermer</Button>

    </div>

  );
}

export default Sync;