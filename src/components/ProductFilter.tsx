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
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            selected === cat
              ? "bg-white text-black border-white"
              : "bg-[#0d0614] text-white border-white/10 hover:bg-white/10"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
