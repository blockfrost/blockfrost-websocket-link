import { messages } from '../constants';
import { Option } from '../types';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'OPEN':
      return 'bg-green-400';
    case 'CONNECTING':
    case 'CLOSING':
      return 'bg-yellow-400';
    case 'UNINSTANTIATED':
    case 'CLOSED':
      return 'bg-red-500';
  }
};

export const getMessagesList = (): Option[] => {
  const options = [];
  messages.map(message => options.push({ value: message, label: message }));
  return options;
};
