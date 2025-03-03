import React from 'react';
import Select, { MultiValue, ActionMeta } from 'react-select';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    selectedOptions: Option[];
    onChange: (selected: Option[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selectedOptions, onChange }) => {
    const handleChange = (newValue: MultiValue<Option>, actionMeta: ActionMeta<Option>) => {
        onChange(newValue as Option[]);
    };

    return <Select isMulti value={selectedOptions} options={options} onChange={handleChange} />;
};

export default MultiSelect;
