import React, { FC } from 'react';

export const Input: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input {...props} />;
};

export const Button: FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return <button {...props} />;
}; 