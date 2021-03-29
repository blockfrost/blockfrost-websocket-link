import React, { ReactElement, useState, useRef, useMemo } from 'react';
import Select from 'react-select';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import AccountInfoOptions from '../AccountInfoOptions';
import { getStatusColor, getMessagesList, getParams } from '../../utils';
import { MESSAGES } from '../../constants';
import { isUri } from 'valid-url';
import { useFormContext } from 'react-hook-form';

const Index = (): ReactElement => {
  const [socketUrl, setSocketUrl] = useState('ws://localhost:3005');
  const [command, setCommand] = useState<keyof typeof MESSAGES>('GET_SERVER_INFO');
  const messageHistory = useRef([]);
  const options = getMessagesList();
  const { register, getValues } = useFormContext();
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    getValues('socketUrl') || socketUrl,
  );

  messageHistory.current = useMemo(() => messageHistory.current.concat(lastMessage), [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'CONNECTING',
    [ReadyState.OPEN]: 'OPEN',
    [ReadyState.CLOSING]: 'CLOSING',
    [ReadyState.CLOSED]: 'CLOSED',
    [ReadyState.UNINSTANTIATED]: 'UNINSTANTIATED',
  }[readyState];

  return (
    <>
      <h1 className="text-1md font-bold leading-7 text-gray-900 sm:text-1xl sm:truncate">SERVER</h1>
      <div className="flex flex-row mt-5">
        <input
          className="shadow appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm"
          name="socketUrl"
          type="text"
          ref={register}
          defaultValue={socketUrl}
          onChange={e => {
            const url = e.target.value;
            if (url !== '' && isUri(url)) {
              setSocketUrl(e.target.value);
            }
          }}
        />
        <div
          className={`${getStatusColor(
            connectionStatus,
          )} text-white p-2 rounded leading-none flex items-center font-semibold ml-2`}
        >
          {connectionStatus}
        </div>
      </div>
      <div className="mt-5 flex flex-row">
        <div className="max-w-sm" style={{ width: 384 }}>
          <Select
            options={options}
            defaultValue={{ label: 'GET_SERVER_INFO', value: 'GET_SERVER_INFO' }}
            onChange={({ value }) => {
              setCommand(value as keyof typeof MESSAGES);
            }}
          />
        </div>
        <button
          style={{ minWidth: 187 }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
          onClick={() => {
            const params = getParams(command, getValues);
            sendMessage(JSON.stringify({ command, params }));
          }}
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
    </>
  );
};

export default Index;
