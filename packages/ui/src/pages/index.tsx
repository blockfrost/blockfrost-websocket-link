import React, { ReactElement, useState, useRef, useMemo } from 'react';
import Select from 'react-select';

import useWebSocket, { ReadyState } from 'react-use-websocket';
import Navigation from '../components/Navigation';
import AccountInfoOptions from '../components/AccountInfoOptions';
import { getStatusColor, getMessagesList } from '../utils';
import { FormProvider, useFormContext } from 'react-hook-form';

const getMessage = (command: string) => {
  return { command };
};

const Index = (): ReactElement => {
  const [socketUrl] = useState('ws://localhost:3005');
  const [command, setCommand] = useState('GET_SERVER_INFO');
  const messageHistory = useRef([]);
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const methods = useFormContext();

  messageHistory.current = useMemo(() => messageHistory.current.concat(lastMessage), [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'CONNECTING',
    [ReadyState.OPEN]: 'OPEN',
    [ReadyState.CLOSING]: 'CLOSING',
    [ReadyState.CLOSED]: 'CLOSED',
    [ReadyState.UNINSTANTIATED]: 'UNINSTANTIATED',
  }[readyState];

  return (
    <FormProvider {...methods}>
      <div>
        <Navigation />
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 mt-10">
          <h1 className="text-1md font-bold leading-7 text-gray-900 sm:text-1xl sm:truncate">
            SERVER
          </h1>
          <div className="flex flex-row mt-5">
            <input
              className="shadow appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm"
              id="username"
              type="text"
              value={socketUrl}
            />
            <div
              className={`${getStatusColor(
                connectionStatus,
              )} text-white p-2 rounded leading-none flex items-center font-semibold ml-2`}
            >
              CONNECTION IS {connectionStatus}
            </div>
          </div>
          <div className="mt-5 flex flex-row">
            <div className="max-w-sm" style={{ width: 384 }}>
              <Select
                onChange={option => {
                  setCommand(option.value);
                }}
                defaultValue={{ value: 'GET_SERVER_INFO', label: 'GET_SERVER_INFO' }}
                options={getMessagesList()}
              />
            </div>
            <button
              style={{ minWidth: 187 }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
              onClick={() => sendMessage(JSON.stringify(getMessage(command)))}
            >
              SEND MESSAGE
            </button>
          </div>

          {command === 'GET_ACCOUNT_INFO' && <AccountInfoOptions />}

          {lastMessage && connectionStatus === 'OPEN' && (
            <div className="mt-10">
              <h1 className="text-1md font-bold leading-7 text-gray-900 sm:text-1xl sm:truncate">
                RESPONSE
              </h1>
              <pre className="px-6 py-4 bg-white shadow-xs mt-3 overflow-auto">
                {lastMessage && JSON.stringify(JSON.parse(lastMessage.data), null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default Index;
