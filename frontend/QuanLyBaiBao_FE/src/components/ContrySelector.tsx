import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { IconType } from 'react-icons';

interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

interface CountrySelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: IconType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ icon: Icon, value, onChange, placeholder }) => {
  const [options, setOptions] = useState<CountryOption[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        const countryOptions = data.map((country: any) => ({
          value: country.name.common,
          label: country.name.common,
          flag: country.flags?.svg || '',
        }));
        countryOptions.sort((a: CountryOption, b: CountryOption) => a.label.localeCompare(b.label));
        setOptions(countryOptions);
      } catch (error) {
        console.error('Lỗi khi tải danh sách quốc gia:', error);
      }
    };

    fetchCountries();
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  const handleChange = (selected: CountryOption | null) => {
    const event = {
      target: {
        value: selected?.value || '',
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-fifth" />
      </div>
      <div className="pl-10">
        <Select
          options={options}
          value={selectedOption}
          onChange={handleChange}
          placeholder={placeholder}
          isClearable
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: 'rgba(31, 41, 55, 0.5)', // bg-gray-800 bg-opacity-50
              borderColor: '#374151', // border-gray-700
              borderRadius: '0.5rem', // rounded-lg
              paddingLeft: '0.5rem',
              color: '#fff',
            }),
            singleValue: (base) => ({
              ...base,
              color: '#fff',
            }),
            placeholder: (base) => ({
              ...base,
              color: '#9CA3AF', // placeholder-gray-400
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: '#1F2937', // bg-gray-800
              color: '#fff',
            }),
          }}
          formatOptionLabel={(option) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {option.flag && (
                <img
                  src={option.flag}
                  alt={option.label}
                  style={{ width: 20, height: 15, marginRight: 10 }}
                />
              )}
              <span>{option.label}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default CountrySelect;