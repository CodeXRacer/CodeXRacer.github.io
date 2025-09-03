import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { value: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
  { value: 'python', label: 'Python', color: 'text-blue-400' },
  { value: 'java', label: 'Java', color: 'text-orange-400' },
  { value: 'typescript', label: 'TypeScript', color: 'text-blue-500' },
  { value: 'cpp', label: 'C++', color: 'text-purple-400' },
  { value: 'go', label: 'Go', color: 'text-cyan-400' },
  { value: 'rust', label: 'Rust', color: 'text-orange-500' },
  { value: 'php', label: 'PHP', color: 'text-purple-500' }
];

interface LanguageSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

const LanguageSelector = ({ value, onValueChange }: LanguageSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="neon-card border-primary/30 hover:border-primary/50">
        <SelectValue placeholder="Escolha a linguagem" />
      </SelectTrigger>
      <SelectContent className="bg-card border-primary/30">
        {languages.map((lang) => (
          <SelectItem 
            key={lang.value} 
            value={lang.value}
            className="hover:bg-primary/10 focus:bg-primary/10"
          >
            <span className={`font-medium ${lang.color}`}>
              {lang.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;