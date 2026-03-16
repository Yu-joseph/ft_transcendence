import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, maxPlayers: number) => void;
};


function CreateTourn({ isOpen, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);

  if (!isOpen) 
    return null;

  const handleCreate = () => {
    //remove white space fromending
    if (!name.trim())
       return;
    onCreate(name.trim(), maxPlayers);
    setName("");
    setMaxPlayers(4);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 border border-blue-700 rounded-2xl p-8 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-amber-500 mb-4">New Tournament</h2>
        <input
          type="text"
          placeholder="Tournament name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition mb-4"
        />
        <div className="mb-4">
        <label className="block text-amber-500 mb-2">Number of players</label>
        <div className="flex gap-3">
          {[4, 8, 16].map((num) => (
            <button
              key={num}
              onClick={() => setMaxPlayers(num)}
              className={`flex-1 py-3 rounded-xl border font-bold text-lg transition
                ${maxPlayers === num
                  ? "bg-amber-500 border-amber-500 text-slate-900"
                  : "bg-slate-900 border-slate-600 text-white hover:border-amber-500"
                }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
        {/* <div className="mb-4">
          <label className="block  text-amber-500 mb-2">Number of players</label>
          <input type="number"
            min={4}
            max={16}
            step={4}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div> */}
          {/* //e is for events  */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-600 text-gray-300 hover:bg-slate-700 transition">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim()} className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-40 transition">Create</button>
        </div>
      </div>
    </div>
  );
}

export default CreateTourn;