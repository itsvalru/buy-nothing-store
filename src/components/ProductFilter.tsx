type Props = {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
};

export default function ProductFilter({
  categories,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {["All", ...categories].map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border ${
            selected === cat ? "bg-white text-black" : "bg-gray-800 text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
