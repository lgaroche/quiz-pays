import { ReactNode, MouseEventHandler } from 'react';

interface ButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
}

const Button = ({ onClick, children, className }: ButtonProps) => {
  return (
    <button onClick={onClick} className={`bg-blue-400 hover:bg-blue-300 text-white font-bold text-xl p-2 rounded-lg ${className}`}>
      {children}
    </button>
  )
}

export default Button