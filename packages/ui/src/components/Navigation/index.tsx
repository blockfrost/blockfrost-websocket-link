import React, { ReactElement } from 'react';

function Navigation(): ReactElement {
  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <img className="block lg:hidden h-8 w-auto" src="/images/logo.svg" alt="Workflow" />
              <img className="hidden lg:block h-8 w-auto" src="/images/logo.svg" alt="Workflow" />
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="hidden sm:block sm:ml-6 text-gray-800 font-semibold">
              WEBSOCKET LINK EXPLORER
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
