import { useState, useEffect } from "react";

interface ToggleModelProps {
  initialModel: string;
  onToggle: (model: string) => void;
}

export default function ToggleModel({ initialModel, onToggle }: ToggleModelProps) {
  const [model, setModel] = useState(initialModel);

  useEffect(() => {
    setModel(initialModel);  // Sync state with the passed prop
  }, [initialModel]);

  const toggleModel = () => {
    const newModel = model === "chatgpt-4o-latest" ? "o1" : "chatgpt-4o-latest";
    setModel(newModel);
    onToggle(newModel);  // Trigger the onToggle callback to notify the parent
  };

  return (
    <button
      onClick={toggleModel}
      className="relative w-32 h-10 flex items-center justify-between bg-gray-200 rounded-full p-1 transition-all"
    >
      <span
        className={`absolute left-1 top-1 bottom-1 w-14 bg-white rounded-full shadow-md transition-all ${
          model === "chatgpt-4o-latest" ? "translate-x-0" : "translate-x-16"
        }`}
      ></span>
      <span className="flex-1 text-center text-sm font-medium text-gray-700">GPT-4o</span>
      <span className="flex-1 text-center text-sm font-medium text-gray-700">GPT-o1</span>
    </button>
  );
}
