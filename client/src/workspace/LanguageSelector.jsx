import { LANGUAGE_VERSIONS } from "../Constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "text-blue-400";

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <select 
      className="form-select text-base rounded-lg border-gray-300 bg-white text-gray-900 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
      value={language}
      onChange={(e) => onSelect(e.target.value)}
    >
      {languages.map(([lang, version]) => (
        <option key={lang} value={lang}>
          {lang.charAt(0).toUpperCase() + lang.slice(1)}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;