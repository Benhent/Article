import { IconType } from 'react-icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: IconType;
}

const Input: React.FC<InputProps> = ({ icon: Icon, ...props }) => {
  return (
    <div className='relative mb-6'>
      <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
        <Icon className='size-5 text-fifth' />
      </div>
      <input
        {...props}
        className='w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-secondary focus:ring-2 focus:ring-secondary text-white placeholder-gray-400 transition duration-200'
      />
    </div>
  );
};

export default Input;