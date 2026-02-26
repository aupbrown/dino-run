interface Props {
  value: string;
  onChange: (color: string) => void;
}

const PRESETS = ['#535353', '#e06060', '#6090e0', '#60c060', '#c060c0', '#e0a030', '#30b0b0'];

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-purple-700">Dino Color</label>
      <div className="flex items-center gap-2 flex-wrap">
        {PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: value === c ? '#7c3aed' : 'transparent',
              boxShadow: value === c ? '0 0 0 2px #c4b5fd' : 'none',
            }}
            title={c}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-full border-2 border-purple-200 cursor-pointer p-0 overflow-hidden"
          title="Custom color"
          style={{ padding: 0 }}
        />
      </div>
    </div>
  );
}
